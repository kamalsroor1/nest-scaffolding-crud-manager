# ⚙️ تصميم الـ CRUD Generator — النجمة الرئيسية للمشروع

---

## 1. الفكرة

أداة CLI بتاخد اسم الـ Entity والـ fields وبتولد كل الكود اللازم في ثوان:

```bash
# مثال 1: Entity بسيطة
npm run generate -- --name=Product --fields="name:string,price:number,stock:number,isActive:boolean"

# مثال 2: مع relations
npm run generate -- --name=Order --fields="total:number,status:string" --relations="userId:User"

# مثال 3: مع options
npm run generate -- --name=Category --fields="name:string,slug:string" --frontend=true --swagger=true
```

---

## 2. التقنيات المقترحة للـ Generator

| الأداة | السبب |
|--------|-------|
| **Plop.js** | أسهل و أبسط لعمل file generators بـ Handlebars templates |
| `@nestjs/schematics` | الطريقة الرسمية لـ NestJS لكن أصعب في الـ custom logic |
| **ts-morph** | لو عايز تعدّل ملفات موجودة (زي `app.module.ts`) برمجياً |

**الاختيار:** Plop.js + ts-morph للـ auto-registration

---

## 3. الملفات اللي بيولّدها

### Backend

#### `create-{name}.dto.ts`

```typescript
// Generated: CreateProductDto
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15' })
  @IsString()
  name: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  stock: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

#### `{name}.service.ts`

```typescript
// Generated: ProductsService
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 10, search } = query;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const record = await this.prisma.product.findUnique({ where: { id } });
    if (!record) throw new NotFoundException(`Product #${id} not found`);
    return record;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

#### `{name}.controller.ts`

```typescript
// Generated: ProductsController
@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('create:products')
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @Permissions('read:products')
  @ApiOperation({ summary: 'Get all products (paginated)' })
  findAll(@Query() query: PaginationDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Permissions('read:products')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('update:products')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('delete:products')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
```

---

### Frontend (React)

#### `{Name}ListPage.tsx`

```tsx
// Generated: ProductsListPage
export default function ProductsListPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, limit, setPage } = usePagination();

  useEffect(() => {
    productsApi.getAll({ page, limit }).then(res => {
      setData(res.data.data);
      setLoading(false);
    });
  }, [page]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'isActive', label: 'Active' },
    { key: 'actions', label: '' },
  ];

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}
```

---

## 4. Auto-Registration في `app.module.ts`

بعد ما يتولد الـ module، الـ generator بيعدّل `app.module.ts` تلقائياً بـ ts-morph:

```typescript
// ts-morph code يضيف الـ import والـ module
const sourceFile = project.getSourceFileOrThrow('src/app.module.ts');

// يضيف الـ import
sourceFile.addImportDeclaration({
  moduleSpecifier: './modules/products/products.module',
  namedImports: ['ProductsModule'],
});

// يضيف للـ imports array
const appModule = sourceFile.getClassOrThrow('AppModule');
// ... add to imports array
```

---

## 5. خطوات تشغيل الـ Generator

```bash
# 1. شغّل الـ generator
npm run generate -- --name=Product --fields="name:string,price:number"

# 2. عدّل الـ Prisma schema (الـ generator بيضيف model تلقائياً)
npx prisma migrate dev --name "add_products"

# 3. شغّل المشروع — المفروض يشتغل من غير أي تعديل يدوي
npm run start:dev
```

---

## 6. Field Types المدعومة

| TypeScript Type | Prisma Type | class-validator |
|----------------|-------------|-----------------|
| `string` | `String` | `@IsString()` |
| `number` | `Float` | `@IsNumber()` |
| `int` | `Int` | `@IsInt()` |
| `boolean` | `Boolean` | `@IsBoolean()` |
| `date` | `DateTime` | `@IsDateString()` |
| `email` | `String` | `@IsEmail()` |
| `uuid` | `String @id` | `@IsUUID()` |
| `text` | `String` | `@IsString()` |

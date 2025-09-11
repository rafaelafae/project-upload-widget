import { z } from 'zod'
import { type Either, makeRight } from '@/shared/either'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { asc, count, desc, ilike } from 'drizzle-orm'

const getUploadsInput = z.object({ // Define o esquema de validação para os parâmetros de entrada da função getUploads
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
})

type GetUploadsInput = z.input<typeof getUploadsInput>
type GetUploadsOutput = {
  // Define o tipo de saída da função getUploads
  uploads: {
    id: string
    name: string
    remoteKey: string
    remoteUrl: string
    createdAt: Date
  }[]
  total: number
}

export async function getUploads( 
  // Função para buscar uploads
  input: GetUploadsInput
): Promise<Either<never, GetUploadsOutput>> {
  const { searchQuery, page, pageSize, sortBy, sortDirection } =
    getUploadsInput.parse(input)

    const [uploads, [{ total }]] = await Promise.all([
      // Busca os uploads no banco de dados e conta o número total de uploads
      db
        .select({
          id: schema.uploads.id,
          name: schema.uploads.name,
          remoteKey: schema.uploads.remoteKey,
          remoteUrl: schema.uploads.remoteUrl,
          createdAt: schema.uploads.createdAt,
        })
        .from(schema.uploads)
        .where(
          searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
        )
        .orderBy(fields =>{
          if(sortBy && sortDirection === 'asc'){
            return asc(fields[sortBy])
          }
          if(sortBy && sortDirection === 'desc'){
            return desc(fields[sortBy])
          }

          return desc(fields.id)
        })
        .offset((page - 1) + pageSize)
        .limit(pageSize),

      db
        .select({ total: count(schema.uploads.id)})
        .from(schema.uploads)
        .where(
          searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
        )
    ])

  return makeRight({
    uploads,
    total
  })
}

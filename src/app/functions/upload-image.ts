import { Readable } from 'node:stream'
import { z } from 'zod'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { type Either, makeLeft, makeRight } from '@/shared/either'
import { InvalidFileFormat } from './errors/invalid-file-format'

const uploadImageInput = z.object({
  // Validação de dados
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadImageInput = z.input<typeof uploadImageInput> // Tipo de entrada

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] // Tipos MIME permitidos

export async function uploadImage(
  // Função para fazer upload de imagem
  input: UploadImageInput
): Promise<Either<InvalidFileFormat, { url: string }>> {
  const { fileName, contentType, contentStream } = uploadImageInput.parse(input) // Valida os dados de entrada

  if (!allowedMimeTypes.includes(contentType)) {
    // Verifica se o tipo MIME é permitido
    return makeLeft(new InvalidFileFormat())
  }

  const { key, url } = await uploadFileToStorage({
    // Faz o upload do arquivo
    folder: 'images',
    fileName,
    contentType,
    contentStream,
  })

  await db.insert(schema.uploads).values({
    // Salva os dados do upload no banco de dados
    name: fileName,
    remoteKey: key,
    remoteUrl: url,
  })

  return makeRight({ url }) // Retorna a URL da imagem
}

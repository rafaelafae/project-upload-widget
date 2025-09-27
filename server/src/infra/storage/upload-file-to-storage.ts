import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { env } from '@/env'
import { r2 } from './client'

const uploadFileToStorageInput = z.object({
  // Validação de dados
  folder: z.enum(['images', 'downloads']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput> // Tipo de entrada

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
  // Função para fazer upload de arquivo
  const { folder, fileName, contentType, contentStream } =
    uploadFileToStorageInput.parse(input) // Valida os dados de entrada

  const fileExtension = extname(fileName) // Pega a extensão do arquivo
  const fileNameWithoutExtension = basename(fileName) // Pega o nome do arquivo sem a extensão
  const sanitizedFileName = fileNameWithoutExtension.replace(
    // Remove caracteres especiais do nome do arquivo
    /[^a-zA-Z0-9]/g,
    ''
  )
  const sanitizedFileNameWithExtension = `${sanitizedFileName}${fileExtension}` // Nome do arquivo sanitizado com a extensão

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileNameWithExtension}` // Nome único do arquivo com a pasta

  const upload = new Upload({
    // Faz o upload do arquivo
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CLOUDFLARE_BUCKET,
      Body: contentStream,
      ContentType: contentType,
      ContentDisposition: `attachment; filename=${fileName}`
    },
  })

  await upload.done() // Espera o upload terminar

  return {
    // Retorna o nome do arquivo e a URL pública
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
  }
}

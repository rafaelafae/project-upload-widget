import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { uploadImage } from '@/app/functions/upload-image'
import { isRight, unwrapEither } from '@/shared/either'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  // Define a rota de upload de imagem
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        consumes: ['multipart/form-data'],
        response: {
          201: z.null().describe('Image uploaded successfully'),
          400: z.object({ message: z.string() }),
        },
      },
    },

    async (request, reply) => {
      // Função para tratar a requisição
      const uploadedFile = await request.file({
        // Pega o arquivo enviado na requisição
        limits: { fileSize: 1024 * 1024 * 2 },
      })

      if (!uploadedFile) {
        // Se não houver arquivo, retorna erro
        return reply.status(400).send({ message: 'File is required' })
      }

      const result = await uploadImage({
        // Chama a função de upload de imagem
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      })

      if (isRight(result)) {
        // Se o upload for bem sucedido, retorna sucesso
        console.log(unwrapEither(result))
        return reply.status(201).send()
      }

      const error = unwrapEither(result) // Desembrulha o erro

      switch (
        error.constructor.name // Trata o erro
      ) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}

import { jsonSchemaTransform } from 'fastify-type-provider-zod'

type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0]

// Função que transforma o schema gerado pelo fastify-type-provider-zod
// para o formato aceito pelo swagger

export function transformSwaggerSchema(data: TransformSwaggerSchemaData) {
  // data é o mesmo envia pelo transform de swagger
  const { schema, url } = jsonSchemaTransform(data)

  if (schema.consumes?.includes('multipart/form-data')) {
    if (schema.body === undefined) {
      schema.body = {
        type: 'object',
        required: [],
        properties: {},
      }
    }

    // @ts-expect-error: Ignorar erro de tipagem ao adicionar propriedade file
    schema.body.properties.file = {
      type: 'string',
      format: 'binary',
    }

    // @ts-expect-error: Ignorar erro de tipagem ao adicionar propriedade file
    schema.body.required.push('file')
  }

  return { schema, url }
}

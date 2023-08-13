import Fastify from 'fastify'

const fastify = Fastify()

fastify.get('/', async function (request, reply) {
  await reply.send({ hello: 'world' })
})

fastify.listen({ port: 5000 }, function (err, address) {
  console.log(address)
  if (err != null) {
    fastify.log.error(err)
  }
})

export default fastify

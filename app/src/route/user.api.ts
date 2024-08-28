// import { init } from '../tracing'
// init('demo-node-service', 'development') // calling tracer with 
import * as Router from 'koa-router'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = new Router()

router.get('/user', async (ctx, next) => {
    const users = await prisma.user.findMany()
    ctx.body = users
})

router.post('/user', async (ctx, next) => {
    const {
        userId,
        password
    } = ctx.request.body
    const user = await prisma.user.create({
        data: {
            userId,
            password,
            createdBy: '1',
            updatedBy: '1',
            createdAt: new Date(),
            updatedAt: new Date(),
            deleted: false
        },
    })
    ctx.body = user
})

router.put('/user', async (ctx, next) => {
    const {
        id,
        userId,
        password
    } = ctx.request.body
    const user = await prisma.user.update({
        where: { id },
        data: {
            userId,
            password,
            updatedBy: '1',
        },
    })
    ctx.body = user
})

router.delete('/user', async (ctx, next) => {
    const {
        id,
    } = ctx.request.body
    const user = await prisma.user.delete({
        where: { id }
    })
    ctx.body = user
})

router.get('/user/about', (ctx, next) => {
    ctx.body = '소개'
})

export default router
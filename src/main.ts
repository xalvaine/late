import 'dotenv/config'
import 'reflect-metadata'
import { Markup, Telegraf } from 'telegraf'
import { createConnection, getConnectionOptions, getRepository } from 'typeorm'

import { Chat, Colleague, Delay } from './entities'

const bot = new Telegraf(process.env.BOT_TOKEN as string)

bot.on(`text`, async (ctx, next) => {
  const chatRepository = getRepository(Chat)

  const chat = await chatRepository.findOne(ctx.chat?.id.toString())

  if (!chat && ctx.message.text !== `/start`) {
    return ctx.reply(`Для начала работы используйте команду /start`)
  }

  return next()
})

bot.start(async (ctx) => {
  const chatRepository = getRepository(Chat)

  await chatRepository.save({ id: ctx.chat.id.toString() })

  ctx.reply(`Привет`)
})

bot.command(`colleagues`, async (ctx) => {
  const chatRepository = getRepository(Chat)
  const colleagueRepository = getRepository(Colleague)

  const chat = await chatRepository.findOne(ctx.chat.id.toString())

  return ctx.reply(
    `Список коллег`,
    Markup.inlineKeyboard(
      (await colleagueRepository.find({ chat })).map((colleague) => [
        Markup.button.callback(colleague.name, `colleague ${colleague.name}`),
      ]),
    ),
  )
})

bot.command(`delays`, async (ctx) => {
  const chatRepository = getRepository(Chat)
  const colleagueRepository = getRepository(Colleague)

  const chat = await chatRepository.findOne(ctx.chat.id.toString())
  const colleagues = await colleagueRepository.find({
    where: { chat },
    relations: [`delays`],
  })

  ctx.reply(
    [
      `Количество опозданий`,
      ...colleagues.map(
        (colleague) => `${colleague.name} ${colleague.delays.length}`,
      ),
    ].join(`\n`),
  )
})

bot.command(`add_delay`, async (ctx) => {
  const chatRepository = getRepository(Chat)
  const colleagueRepository = getRepository(Colleague)

  const chat = await chatRepository.findOne(ctx.chat.id.toString())
  const colleagues = await colleagueRepository.find({
    where: { chat },
    relations: [`delays`],
  })

  ctx.reply(
    `Добавить опоздание`,
    Markup.inlineKeyboard(
      colleagues.map((colleague) => [
        Markup.button.callback(colleague.name, `delay ${colleague.name}`),
      ]),
    ),
  )
})

bot.command(`reset_delays`, async (ctx) => {
  const delaysRepository = getRepository(Delay)

  await delaysRepository.clear()

  ctx.reply(`Список опозданий сброшен`)
})

bot.command(`add`, async (ctx) => {
  const chatRepository = getRepository(Chat)
  const colleagueRepository = getRepository(Colleague)

  const chat = await chatRepository.findOne(ctx.chat.id.toString())
  const name = ctx.message.text.split(` `).slice(1).join(` `)

  try {
    await colleagueRepository.save({ name, chat })
    ctx.reply(`Коллега добавлен(а)`)
  } catch (error) {
    ctx.reply(`Ошибка при добавлении`)
  }
})

bot.action(/colleague .*/, async (ctx) => {
  const name = ctx.match.toString().split(` `).slice(1).join(` `)

  ctx.reply(
    name,
    Markup.inlineKeyboard([
      Markup.button.callback(`Опоздание`, `delay ${name}`),
      Markup.button.callback(`Удалить`, `delete ${name}`),
    ]),
  )
  ctx.answerCbQuery()
})

bot.action(/delete .*/, async (ctx) => {
  const name = ctx.match.toString().split(` `).slice(1).join(` `)

  const colleagueRepository = getRepository(Colleague)

  await colleagueRepository.delete({ name })

  ctx.reply(`Коллега удален(а)`)
  ctx.answerCbQuery()
})

bot.action(/delay .*/, async (ctx) => {
  const name = ctx.match.toString().split(` `).slice(1).join(` `)

  const colleagueRepository = getRepository(Colleague)
  const delayRepository = getRepository(Delay)

  const colleague = await colleagueRepository.findOne({ name })
  await delayRepository.save({ colleague })

  ctx.reply(`Опоздание добавлено (${colleague?.name})`)
  ctx.answerCbQuery()
})

const startApp = async () => {
  const connectionOptions = await getConnectionOptions()

  await createConnection({
    ...connectionOptions,
    synchronize: true,
    logging: false,
  })

  await bot.launch()
}

startApp()

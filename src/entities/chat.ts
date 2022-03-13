import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { Colleague } from '.'

@Entity()
export class Chat {
  @PrimaryGeneratedColumn({ type: `bigint` })
  id!: string

  @OneToMany(() => Colleague, (colleague) => colleague.chat)
  colleagues!: Colleague[]
}

import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Chat, Delay } from '.'

@Entity()
export class Colleague {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @ManyToOne(() => Chat, (chat) => chat.colleagues)
  chat!: Chat

  @OneToMany(() => Delay, (delay) => delay.colleague, { onDelete: `CASCADE` })
  delays!: Delay[]
}

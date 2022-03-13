import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { Colleague } from '.'

@Entity()
export class Delay {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Colleague, (colleague) => colleague.delays, {
    onDelete: `CASCADE`,
  })
  colleague!: Colleague

  @CreateDateColumn()
  datetime!: Date
}

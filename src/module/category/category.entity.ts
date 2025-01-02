import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ['article'], default: 'article' })
  type: 'article';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'int', nullable: true })
  parentCategoryId: number;

  @Column({ type: 'int', default: 1 })
  nsleft: number;

  @Column({ type: 'int', default: 2 })
  nsright: number;

  @OneToMany(() => Category, (category) => category.parentCategory)
  children: Category[];

  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: Category;
}

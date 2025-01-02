import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class DataCleanupService {
  private readonly logger = new Logger(DataCleanupService.name);

  constructor(private readonly dataSource: DataSource) {}

  private readonly BATCH_SIZE = 100;

  @Cron('0 2 * * *')
  async handleCleanupTask() {
    this.logger.log('开始执行物理删除准备任务...');

    try {
      let updatedCount;
      let totalUpdated = 0;

      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - 14); // 14天前的日期

      do {
        const result = await this.dataSource
          .createQueryBuilder()
          .update('User') // 或者你的实际用户实体名称
          .set({ deletedAt: () => 'CURRENT_TIMESTAMP' }) // 标记为已删除，设置删除时间为当前时间
          .where('deletedAt <= :thresholdDate', { thresholdDate })
          .limit(this.BATCH_SIZE)
          .execute();

        updatedCount = result.affected || 0;
        totalUpdated += updatedCount;

        this.logger.log(`已标记当前批次记录数: ${updatedCount}`);
      } while (updatedCount > 0);

      this.logger.log(`物理删除准备任务完成，总共标记记录数: ${totalUpdated}`);
    } catch (error) {
      this.logger.error('物理删除准备任务中发生错误:', error);
    }
  }

  // 物理删除标记为已删除超过14天的用户
  async physicalDeleteOldDeletedUsers(): Promise<void> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 14);

    const usersToDelete = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from('User') // 或者你的实际用户实体名称
      .where('deletedAt <= :thresholdDate', { thresholdDate })
      .execute();

    this.logger.log(`物理删除了 ${usersToDelete.affected} 个用户`);
  }
}

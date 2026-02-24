import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/* eslint-disable @typescript-eslint/no-unsafe-return */
@Injectable()
export class BullBoardAdapter implements OnModuleDestroy {
  private serverAdapter: ExpressAdapter;
  private queues: Map<string, Queue> = new Map();

  constructor(private readonly config: ConfigService) {
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/queues');
  }

  addQueue(name: string, queue: Queue) {
    this.queues.set(name, queue);
    this.updateBoard();
  }

  removeQueue(name: string) {
    this.queues.delete(name);
    this.updateBoard();
  }

  private updateBoard() {
    const bullMQAdapters = Array.from(this.queues.values()).map(
      (queue) => new BullMQAdapter(queue),
    );

    createBullBoard({
      queues: bullMQAdapters,
      serverAdapter: this.serverAdapter,
    });
  }

  getRouter() {
    return this.serverAdapter.getRouter();
  }

  onModuleDestroy() {
    this.queues.clear();
  }
}

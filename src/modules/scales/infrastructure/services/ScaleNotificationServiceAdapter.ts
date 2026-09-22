import type {
  IScaleNotificationService,
  ScaleNotificationResult,
} from "@/modules/scales/application/ports/IScaleNotificationService";

interface NotificationDependencies {
  notifyScaleMembers: { execute(input: unknown): Promise<unknown> };
  notifyPublishedScalesByDate: {
    execute(input: unknown): Promise<ScaleNotificationResult>;
  };
}

export class ScaleNotificationServiceAdapter
  implements IScaleNotificationService
{
  constructor(private readonly dependencies: NotificationDependencies) {}

  notifyScaleMembers(input: unknown): Promise<unknown> {
    return this.dependencies.notifyScaleMembers.execute(input);
  }

  notifyPublishedScalesByDate(
    input: unknown,
  ): Promise<ScaleNotificationResult> {
    return this.dependencies.notifyPublishedScalesByDate.execute(input);
  }
}

import { CreateService } from "@/application/use-cases/service/CreateService";
import { DeleteService } from "@/application/use-cases/service/DeleteService";
import { GetService } from "@/application/use-cases/service/GetService";
import { ListServices } from "@/application/use-cases/service/ListServices";
import { UpdateService } from "@/application/use-cases/service/UpdateService";
import { CreateServiceTemplate } from "@/application/use-cases/serviceTemplate/CreateServiceTemplate";
import { DeleteServiceTemplate } from "@/application/use-cases/serviceTemplate/DeleteServiceTemplate";
import { GenerateWeekServices } from "@/application/use-cases/serviceTemplate/GenerateWeekServices";
import { GetServiceTemplate } from "@/application/use-cases/serviceTemplate/GetServiceTemplate";
import { ListServiceTemplates } from "@/application/use-cases/serviceTemplate/ListServiceTemplates";
import { UpdateServiceTemplate } from "@/application/use-cases/serviceTemplate/UpdateServiceTemplate";
import type { IMinistryRepository } from "@/domain/ports/IMinistryRepository";
import type { IServiceRepository } from "@/domain/ports/IServiceRepository";
import type { IServiceTemplateRepository } from "@/domain/ports/IServiceTemplateRepository";
import { MinistryFirebaseRepository } from "@/infra/firebase-admin/repositories/MinistryFirebaseRepository";
import { ServiceFirebaseRepository } from "@/infra/firebase-admin/repositories/ServiceFirebaseRepository";
import { ServiceTemplateFirebaseRepository } from "@/infra/firebase-admin/repositories/ServiceTemplateFirebaseRepository";
import { scaleContainer } from "@/infra/di/scale/container";

class ServiceContainer {
  private static _serviceRepository: IServiceRepository | null = null;
  private static _serviceTemplateRepository: IServiceTemplateRepository | null =
    null;
  private static _ministryRepository: IMinistryRepository | null = null;
  private static _listServices: ListServices | null = null;
  private static _createService: CreateService | null = null;
  private static _getService: GetService | null = null;
  private static _updateService: UpdateService | null = null;
  private static _deleteService: DeleteService | null = null;
  private static _listServiceTemplates: ListServiceTemplates | null = null;
  private static _getServiceTemplate: GetServiceTemplate | null = null;
  private static _createServiceTemplate: CreateServiceTemplate | null = null;
  private static _updateServiceTemplate: UpdateServiceTemplate | null = null;
  private static _deleteServiceTemplate: DeleteServiceTemplate | null = null;
  private static _generateWeekServices: GenerateWeekServices | null = null;

  private constructor() {}

  static get serviceRepository(): IServiceRepository {
    if (!ServiceContainer._serviceRepository) {
      ServiceContainer._serviceRepository = new ServiceFirebaseRepository();
    }
    return ServiceContainer._serviceRepository;
  }

  static get serviceTemplateRepository(): IServiceTemplateRepository {
    if (!ServiceContainer._serviceTemplateRepository) {
      ServiceContainer._serviceTemplateRepository =
        new ServiceTemplateFirebaseRepository();
    }
    return ServiceContainer._serviceTemplateRepository;
  }

  static get ministryRepository(): IMinistryRepository {
    if (!ServiceContainer._ministryRepository) {
      ServiceContainer._ministryRepository = new MinistryFirebaseRepository();
    }
    return ServiceContainer._ministryRepository;
  }

  static get listServices(): ListServices {
    if (!ServiceContainer._listServices) {
      ServiceContainer._listServices = new ListServices(
        ServiceContainer.serviceRepository,
      );
    }
    return ServiceContainer._listServices;
  }

  static get createService(): CreateService {
    if (!ServiceContainer._createService) {
      ServiceContainer._createService = new CreateService(
        ServiceContainer.serviceRepository,
      );
    }
    return ServiceContainer._createService;
  }

  static get getService(): GetService {
    if (!ServiceContainer._getService) {
      ServiceContainer._getService = new GetService(
        ServiceContainer.serviceRepository,
      );
    }
    return ServiceContainer._getService;
  }

  static get updateService(): UpdateService {
    if (!ServiceContainer._updateService) {
      ServiceContainer._updateService = new UpdateService(
        ServiceContainer.serviceRepository,
      );
    }
    return ServiceContainer._updateService;
  }

  static get deleteService(): DeleteService {
    if (!ServiceContainer._deleteService) {
      ServiceContainer._deleteService = new DeleteService(
        ServiceContainer.serviceRepository,
      );
    }
    return ServiceContainer._deleteService;
  }

  static get listServiceTemplates(): ListServiceTemplates {
    if (!ServiceContainer._listServiceTemplates) {
      ServiceContainer._listServiceTemplates = new ListServiceTemplates(
        ServiceContainer.serviceTemplateRepository,
      );
    }
    return ServiceContainer._listServiceTemplates;
  }

  static get getServiceTemplate(): GetServiceTemplate {
    if (!ServiceContainer._getServiceTemplate) {
      ServiceContainer._getServiceTemplate = new GetServiceTemplate(
        ServiceContainer.serviceTemplateRepository,
      );
    }
    return ServiceContainer._getServiceTemplate;
  }

  static get createServiceTemplate(): CreateServiceTemplate {
    if (!ServiceContainer._createServiceTemplate) {
      ServiceContainer._createServiceTemplate = new CreateServiceTemplate(
        ServiceContainer.serviceTemplateRepository,
      );
    }
    return ServiceContainer._createServiceTemplate;
  }

  static get updateServiceTemplate(): UpdateServiceTemplate {
    if (!ServiceContainer._updateServiceTemplate) {
      ServiceContainer._updateServiceTemplate = new UpdateServiceTemplate(
        ServiceContainer.serviceTemplateRepository,
      );
    }
    return ServiceContainer._updateServiceTemplate;
  }

  static get deleteServiceTemplate(): DeleteServiceTemplate {
    if (!ServiceContainer._deleteServiceTemplate) {
      ServiceContainer._deleteServiceTemplate = new DeleteServiceTemplate(
        ServiceContainer.serviceTemplateRepository,
      );
    }
    return ServiceContainer._deleteServiceTemplate;
  }

  static get generateWeekServices(): GenerateWeekServices {
    if (!ServiceContainer._generateWeekServices) {
      ServiceContainer._generateWeekServices = new GenerateWeekServices(
        ServiceContainer.serviceTemplateRepository,
        ServiceContainer.serviceRepository,
      );
    }
    return ServiceContainer._generateWeekServices;
  }
}

export const serviceContainer = ServiceContainer;

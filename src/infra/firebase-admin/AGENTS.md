# Firebase Admin

O Firebase Admin é usado apenas para integrações externas que não pertencem à
persistência de dados de negócio:

- Firebase Authentication, quando necessário para validar identidade externa;
- Firebase Cloud Messaging, para envio de notificações push.

Dados de negócio devem ser persistidos exclusivamente em PostgreSQL por meio
dos repositories Drizzle dos respectivos módulos.

Não criar repositories Firestore, mappers Firestore ou queries de negócio nesta
infraestrutura.

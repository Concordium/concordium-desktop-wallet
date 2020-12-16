# Database migrations 

## Adding a new migration

To generate a new migration file use the following command (from the `app` directory):

```console
yarn knex migrate:make migration_filename --knexfile database/knexfile.ts
```

## Migrate to latest schema

The application automatically runs the required migrations at start up.

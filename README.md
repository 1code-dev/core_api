# 1Code Core API

### Universal errors

- 422

If db constrained has failed, like duplicate entry

- 500

If any other error has occurred

- 409

If db error has occurred

- 400

If authorization has failed

### Commands

Generate types for the project

```shell
# Generate types

npx supabase gen types typescript --project-id "zjngbjykvofvztzjjhye" --schema public > ./src/types/supabase.ts
```

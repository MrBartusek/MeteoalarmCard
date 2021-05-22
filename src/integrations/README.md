# MeteoalarmCard Integrations

## Reference

### Integration
Each integrations class must include **all** of following:

| Name                          | Description                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `get name()`                  | Name of the integration that will be used in config file                        |
| `supports(entity)`            | Does this integration support following entity, used for auto-detect            |
| `isWarningActive(entity)`     | Is there any active warnings for this entity                                    |
| `getResult(entity)`           | Return [result](#result)                                                        |

### Result
| Name               | Required | Description                                                                     |
| ------------------ | -------- | ------------------------------------------------------------------------------- |
| `awarenessLevel`   | Yes      | `Level` from `data.js` file                                                     |
| `awarenessType`    | Yes      | `Event` from `data.js` file                                                     |
| `headline`         | No       | Name of the alert, if provided by integration                                   |

# TinyTasks — Build Plan

Feature list in this PRD: T01–T08. This run builds T02–T08 (T01 shipped).

## This run

- [x] Task data schema: Title, Notes, Due Date, Completed, Completed On/By (blocks-data-gateway-configuration)
- [x] Task history schema: action, changed fields, actor, time (blocks-data-gateway-configuration)
- [x] Access rules: users read/write only their own tasks by Owner (blocks-data-gateway-configuration)
- [x] Admin role + permission to manage users (blocks-iam-access-control)
- [x] Add-task row, counts header and list wiring (blocks-data-gateway-crud)
- [x] Task CRUD: complete, reopen, edit, delete with confirm (blocks-data-gateway-crud)
- [x] Filters All/Active/Completed and empty states (no skill — plain UI)
- [x] History recorded on create, edit, complete, delete (blocks-data-gateway-crud)
- [x] Admin users screen: list, invite, deactivate, reactivate, grant admin (blocks-iam-users)
- [x] Localization modules pushed via Blocks (blocks-localization-configuration, blocks-localization-implementation)
- [x] In-app alert when a task is completed (blocks-notifier)
- [x] Check and build app

## Later runs (not built now)

None — PRD fully covered by this run.

# Splitting Patterns

本参考用于候选文件进入人工判断阶段后，帮助 Agent 选择是否拆分以及如何拆分。这里的模式只能辅助判断，不能替代用户审核闸门。

## 先判断是否值得拆

不要因为文件大就拆。行数不是拆分标准，先回答：

1. 这个文件是否有多个独立职责？
2. 这些职责是否有清晰边界和名称？
3. 这个文件是否属于职责单一、高内聚、顺序性强的合规大文件？
4. 拆分后调用方向是否仍然单向清晰？
5. 拆分是否能降低理解、修改、测试或冲突成本？
6. 是否会制造新的巨大转发器、协调器或胶水层？
7. 是否有足够验证手段确认行为不变？

如果答案不清晰，优先保持原样或只做局部整理。

在执行拆分改动前，必须先提交拆分说明并等待用户明确批准。没有批准时，只能停留在判断和方案阶段。

## 常见拆分模式

### 1. 按业务能力拆分

适用于一个文件混合多个业务能力的情况。

示例：

- `user-billing.ts`
- `user-notifications.ts`
- `user-permissions.ts`

每个拆出模块都应有清楚的业务名词，而不是技术杂物名。

### 2. 按流程阶段拆分

适用于请求处理链、任务流水线或多阶段工作流。

示例：

- `checkout-input.ts`
- `checkout-validation.ts`
- `checkout-execution.ts`
- `checkout-response.ts`

编排逻辑可以保留在主入口，或放到命名明确的 coordinator 模块。

### 3. 按技术层拆分

适用于控制层、服务层、数据层、映射层混在一起的文件。

示例：

- `report-controller.ts`
- `report-service.ts`
- `report-repository.ts`
- `report-mappers.ts`

不要把这种模式强行套用到简单脚本或小型功能。

### 4. 按 UI 区域拆分

适用于超大的前端组件，内部包含多个视觉区块或交互区块。

示例：

- `dashboard-header.vue`
- `dashboard-filters.vue`
- `dashboard-table.vue`
- `dashboard-empty-state.vue`

共享 composable、types、constants 应尽量靠近使用它们的组件树。

### 5. 按状态和副作用拆分

适用于 UI 与状态、副作用、请求、持久化混杂的文件。

示例：

- `use-dashboard-filters.ts`
- `use-dashboard-data.ts`
- `dashboard-table.vue`

只有当状态逻辑可以独立命名并被局部验证时，才抽成 composable。

## 不建议拆分的情况

- 高内聚状态机或强顺序算法
- 常量表、字典表、协议映射、生成文件
- 拆分后需要大量参数穿透或共享可变状态
- 拆分结果只是把一个难懂文件变成多个难懂文件
- 拆分结果制造新的巨大转发器、协调器或胶水层
- 当前任务只需要小范围修复，结构性拆分会扩大风险

## 命名检查

- 沿用仓库中占主导的命名风格
- 同一组文件复用相同的功能词干
- 后缀表达职责，例如 `-types`、`-constants`、`-validators`、`-mappers`、`-store`、`-view`
- 避免 `utils`、`helpers`、`misc`、`temp`、`part1`

## 复查点

1. 拆分是否真的降低了维护成本
2. 导入方向是否清晰
3. 对外 API 是否保持稳定
4. 被移动逻辑是否仍有验证覆盖
5. 是否有模块应该合并回去，因为拆分制造了噪音
6. 是否能说明这次拆分实际降低了什么成本

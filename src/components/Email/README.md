# Email组件模块

邮件列表界面组件，提供邮件列表显示、邮件项渲染和邮件详情查看功能。

## 组件

### EmailList

邮件列表组件，显示所有邮件并集成自动刷新功能。

**功能特性:**
- 显示邮件列表
- 集成5秒自动刷新（可配置）
- 显示加载状态和错误状态
- 空状态提示
- 自动识别子邮箱转发邮件
- 刷新状态指示器

**使用示例:**
```tsx
import { EmailList } from './components/Email';

function App() {
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <EmailList
      selectedEmailId={selectedId}
      onEmailSelect={setSelectedId}
      refreshInterval={5000}
    />
  );
}
```

### EmailItem

单个邮件项组件，显示邮件的基本信息。

**功能特性:**
- 显示发件人、主题、时间和内容预览
- 标识子邮箱转发邮件
- 未读邮件左侧蓝色指示器
- 点击动画效果
- 选中状态高亮
- 相对时间显示（刚刚、X分钟前等）

**使用示例:**
```tsx
import { EmailItem } from './components/Email';

function EmailListItem({ email, isSelected, onSelect }) {
  return (
    <EmailItem
      email={email}
      isSelected={isSelected}
      onClick={onSelect}
    />
  );
}
```

### EmailDetail

邮件详情组件，显示邮件的完整内容。

**功能特性:**
- 显示邮件完整内容
- 自动标记邮件为已读（延迟500ms）
- 显示子邮箱转发标识
- 支持HTML内容渲染
- 玻璃风格设计
- 空状态提示

**使用示例:**
```tsx
import { EmailDetail } from './components/Email';

function EmailViewer({ selectedEmail }) {
  return (
    <EmailDetail email={selectedEmail} />
  );
}
```

## 依赖

这些组件依赖以下上下文和Hook：

- `EmailContext` - 邮件数据和操作
- `SubEmailContext` - 子邮箱列表
- `useAutoRefresh` - 自动刷新功能
- `GlassCard` - 玻璃风格卡片
- `LoadingSpinner` - 加载动画

## 样式

所有组件使用拟态玻璃风格设计：
- 半透明背景
- 背景模糊效果
- 柔和的边框和阴影
- 流畅的动画过渡

## 需求映射

- **需求 2.1**: 登录成功后立即获取并显示邮箱内容
- **需求 2.2**: 每5秒自动刷新邮件列表
- **需求 2.5**: 显示邮件的发件人、主题、时间和内容预览
- **需求 4.4**: 标识子邮箱转发的邮件

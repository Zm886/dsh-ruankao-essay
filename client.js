/**
 * Client half: 在 DSH Web UI 的对话区注册「软考题库速查」面板。
 *
 * - 文案通过 Client locale 服务的命名空间字典提供（zh / en 各一份，键集一致）；
 * - 数据只包含公开内容：历年考试题名、通用理论骨架、写作规格速查；
 * - 注册在 conversation.composer.dock（已分配空间的槽位），不接管页面根节点。
 */

window.__ModuleLoader__.load({
  id: 'dsh-ruankao-essay',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'ruankao-essay.panel';

    // >>> BEGIN generated: client-data
    
    const EXAMS = [
  {
    "year": "2026/05",
    "titles": [
      "信息系统安全保障规划与设计",
      "LLM 大模型在软件测试中的应用",
      "需求评审在软件项目中的应用",
      "软件架构风格"
    ]
  },
  {
    "year": "2025/11",
    "titles": [
      "系统成本效益分析方法",
      "多种软件设计模式在项目中的应用",
      "软件测试技术的应用",
      "云计算运维"
    ]
  },
  {
    "year": "2025/05",
    "titles": [
      "信息系统运维管理技术与应用",
      "软件系统测试方法及应用",
      "信息系统开发方法及应用",
      "模型驱动分析方法及应用"
    ]
  },
  {
    "year": "2024/11",
    "titles": [
      "静态测试方法及其应用",
      "DevOps 在开发时的应用",
      "业务流程分析方法及其应用",
      "信息系统运维管理流程"
    ]
  },
  {
    "year": "2024/05",
    "titles": [
      "基于架构的软件设计",
      "性能测试方法及其应用",
      "多源数据集成方法及其应用",
      "云原生应用开发"
    ]
  },
  {
    "year": "2023/05",
    "titles": [
      "信息系统的可行性分析",
      "DevOps 及其应用",
      "敏捷开发方法（Scrum）",
      "信息系统数据转换和迁移"
    ]
  },
  {
    "year": "2022/05",
    "titles": [
      "原型法及其在信息系统开发中的应用",
      "面向对象设计方法及其应用"
    ]
  },
  {
    "year": "2021/05",
    "titles": [
      "面向对象的信息系统分析方法",
      "静态测试方法及应用",
      "富互联网应用的客户端开发技术",
      "DevSecOps 技术及其应用"
    ]
  },
  {
    "year": "2020/11",
    "titles": [
      "面向服务的信息系统开发方法及其应用",
      "快速应用开发方法（RAD）及其应用",
      "软件设计模式及其应用",
      "遗留系统演化策略及其应用"
    ]
  },
  {
    "year": "2019/05",
    "titles": [
      "系统需求分析方法",
      "系统自动化测试及其应用",
      "处理流程设计方法及应用",
      "企业智能运维技术与方法"
    ]
  },
  {
    "year": "2018/05",
    "titles": [
      "信息系统开发方法论",
      "软件构件管理及其应用",
      "软件系统需求获取技术及应用",
      "数据挖掘方法及应用"
    ]
  },
  {
    "year": "2017/05",
    "titles": [
      "需求分析方法及应用",
      "企业应用集成",
      "数据流图在系统分析与设计中的应用",
      "软件的系统测试及其应用"
    ]
  },
  {
    "year": "2016/05",
    "titles": [
      "软件需求验证方法及其应用",
      "软件的系统测试及其应用",
      "软件开发模型及应用",
      "信息系统规划及实践"
    ]
  }
];
    
    const SKELETONS = [
  {
    "name": "软件测试",
    "points": [
      "系统测试六项内容：功能性、健壮性、性能、用户界面、安全性、安装与反安装",
      "静态测试＝桌前检查＋代码走查＋代码审查",
      "动态测试＝黑盒（等价类、边界值）＋白盒（语句、判定、条件、条件组合、路径覆盖，语句最弱、路径最强）",
      "测试策略＝全过程测试、突出测试重点、测试度量"
    ]
  },
  {
    "name": "架构风格",
    "points": [
      "数据流（批处理、管道—过滤器）／调用返回（主程序—子程序、面向对象、层次结构）／独立构件（进程通信、事件驱动）／虚拟机（解释器、基于规则）／仓库（数据库、黑板）",
      "风格＝构件＋连接件＋约束＋语义模型"
    ]
  },
  {
    "name": "基于架构的软件设计",
    "points": [
      "架构需求→架构设计→架构文档化→架构复审→架构实现→架构演化"
    ]
  },
  {
    "name": "微服务",
    "points": [
      "按业务能力拆分、独立部署、技术异构、故障隔离、按需扩展、组织对齐",
      "治理含注册配置中心、网关路由鉴权限流、熔断降级、链路追踪",
      "跨服务一致性用 TCC、本地消息表＋幂等或只读视图"
    ]
  },
  {
    "name": "企业集成",
    "points": [
      "界面集成（页面）／数据集成（数据访问层）／应用集成（程序内部结构）／业务流程集成",
      "常用企业门户、ESB、数据总线、数据仓库与数据集市",
      "ESB 负责服务管理、协议转换、格式转换、服务路由、消息处理"
    ]
  },
  {
    "name": "安全与保密",
    "points": [
      "网络硬件层（DMZ、防火墙、防毒墙、反向代理、物理隔离、跳板机）",
      "数据层（存储加密、权限细分、全量／增量／差量备份、多机房容灾）",
      "应用层（RBAC、双因素认证、MD5＋salt、令牌机制）"
    ]
  },
  {
    "name": "可靠性（容错与避错）",
    "points": [
      "冗余分结构、时间、信息与冗余附加",
      "软件容错技术包括 N 版本程序设计、恢复块方法、防卫式程序设计"
    ]
  },
  {
    "name": "设计模式",
    "points": [
      "四要素（模式名称、适应场景、解决方案、效果）",
      "三类——创建型 5、结构型 7、行为型 11"
    ]
  },
  {
    "name": "分布式数据库",
    "points": [
      "选型→设计→数据集成→测试→部署",
      "位置透明；两阶段提交保证一致性"
    ]
  },
  {
    "name": "数据挖掘",
    "points": [
      "又称数据库中的知识发现（KDD）",
      "常用方法为分类、聚类、关联分析",
      "过程为问题定义→数据准备→建模→评估→部署→维护",
      "与数据仓库／OLAP 的分工是前者发现模式、后者汇总分析"
    ]
  },
  {
    "name": "需求工程",
    "points": [
      "获取技术含用户访谈、问卷调查、现场观摩、阅读历史文档（各有优缺点与适用场景）",
      "分析方法以数据字典为核心、配合 DFD 与 STD",
      "需求管理含变更管理、版本控制、双向跟踪与状态管理"
    ]
  },
  {
    "name": "开发方法",
    "points": [
      "结构化方法、原型法、面向对象方法",
      "原型＋面向对象的组合常用于需求不清的项目"
    ]
  },
  {
    "name": "项目过程与管理",
    "points": [
      "过程改进靠职责分离（设计／开发／测试分组）、同行评审与专家评审、版本控制与测试独立",
      "成本进度用自底向上估算与挣值分析（PV／EV／AC，费用偏差 EV−AC、进度偏差 EV−PV）",
      "甘特图与里程碑"
    ]
  },
  {
    "name": "信息化战略",
    "points": [
      "信息工程方法（James Martin）＋BSP 的企业过程、数据类与过程／数据类矩阵",
      "数据环境采用 DB＋ODS＋DW"
    ]
  },
  {
    "name": "云原生",
    "points": [
      "原则含服务化、弹性、可观测、韧性、所有过程自动化、零信任、架构持续演进",
      "主要架构模式含服务化、Mesh 化、Serverless、存储计算分离、分布式事务、可观测架构（Logging／Tracing／Metrics）与事件驱动"
    ]
  },
  {
    "name": "DevSecOps",
    "points": [
      "在 DevOps 的规划、开发、交付、运营四阶段中分别嵌入威胁建模、静态扫描与依赖分析、镜像与配置基线扫描及流水线门禁、运行时防护与补丁管理"
    ]
  },
  {
    "name": "遗留系统演化",
    "points": [
      "评价活动为启动评价→业务价值评价→外部环境评价→应用软件评价→分析结果",
      "按业务价值与技术水平组合采用淘汰、继承、改造、集成四种策略",
      "配套系统转换三计划（直接、并行、分段）与数据迁移三方法"
    ]
  }
];
    
    const RULES = [
  "结构：严格 10 段——摘要 → 缘由 → 概况与技术 → 回应子题目 2 → 正文 3 段 → 问题与效果 → 收尾（不足与改进）→ 结论；段与段之间空行分隔，段内折行不算新段",
  "字数：按含标点核对，2500~2800",
  "禁用：标题、「摘要／背景／子题目」字眼、第一人称（首段身份交代除外）、「第一／首先／一是」式分点、Markdown 粗体标记；正文用中文引号「“”」",
  "必备：每个论点配一条项目真实业务实例；效果给量化数据；收尾写 2~3 条不足与改进",
  "时间：建设周期只写在首段，正文不再重复",
  "交付：`.doc`（Word 可打开）＋ `.md` 源稿，文件名与题目一致"
];
    // <<< END generated: client-data
    // ---- 文案字典：zh / en 键集必须一致 ----
    const DICT = {
      zh: {
        'launcher.title': '软考系分论文题库',
        'launcher.label': '打开题库速查',
        'tooltip.hint': '历年真题 / 题型骨架 / 写作规格',
        'panel.title': '软考系分论文题库',
        'panel.subtitle': '{years} 场真题 · {topics} 类题型骨架 · {rules} 条写作规格',
        'panel.close': '关闭题库',
        'panel.search': '搜索题名、理论点或写作规格',
        'panel.searchEmpty': '没有匹配的条目，换个关键词试试',
        'panel.tab.exam': '历年真题',
        'panel.tab.theory': '题型骨架',
        'panel.tab.rules': '写作规格',
        'panel.exam.empty': '该场次暂无记录',
        'panel.exam.paper': '试题',
        'panel.theory.points': '要点',
        'panel.rules.item': '规格',
        'panel.footer': '题库为公开资料；项目背景与数据请使用你自己的真实项目',
      },
      en: {
        'launcher.title': 'Soft Exam essay topic bank',
        'launcher.label': 'Open the topic bank',
        'tooltip.hint': 'exam titles / theory skeletons / writing spec',
        'panel.title': 'Soft Exam essay topic bank',
        'panel.subtitle': '{years} exam sittings · {topics} topic skeletons · {rules} writing rules',
        'panel.close': 'Close the topic bank',
        'panel.search': 'Search titles, theory points or writing rules',
        'panel.searchEmpty': 'No match — try another keyword',
        'panel.tab.exam': 'Exam titles',
        'panel.tab.theory': 'Theory skeletons',
        'panel.tab.rules': 'Writing spec',
        'panel.exam.empty': 'No record for this sitting',
        'panel.exam.paper': 'Paper',
        'panel.theory.points': 'Points',
        'panel.rules.item': 'Rule',
        'panel.footer': 'Public material only; use your own real project data',
      },
    };


    /** 主题 token：容器与控件一律用宿主 token，浅色/深色自动跟随。 */
    const T = {
      overlay: 'var(--dsw-alias-bg-overlay)',
      surface: 'var(--dsw-alias-bg-layer-1)',
      surfaceAlt: 'var(--dsw-alias-bg-layer-2)',
      border: 'var(--dsw-alias-border-l1)',
      borderStrong: 'var(--dsw-alias-border-l2)',
      brand: 'var(--dsw-alias-brand-primary)',
      text: 'var(--dsw-alias-label-primary)',
      textMuted: 'var(--dsw-alias-label-secondary)',
    };

    /** 面板开合状态：入口按钮与模态层分处两个槽位，用一个极小的 store 共享。 */
    function createStore() {
      let state = { open: false, tab: 'exam', query: '', tip: null };
      const listeners = new Set();
      return {
        get() {
          return state;
        },
        set(patch) {
          state = { ...state, ...patch };
          for (const listener of listeners) listener();
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    }

    function useStore(store) {
      const [state, setState] = React.useState(store.get);
      React.useEffect(() => store.subscribe(() => setState(store.get())), [store]);
      return state;
    }

    /** 入口图标：书本 + 列表，纯 currentColor，随主题与宿主字体颜色走。 */
    function BankIcon(props) {
      const size = props.size || 16;
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { display: 'block', flex: 'none' },
        },
        h('path', { d: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.6 1.6 0 0 0-1.6-1.6H4z' }),
        h('path', { d: 'M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.6 1.6 0 0 1 1.6-1.6H20z' }),
      );
    }

    function Launcher(props) {
      const { store, t } = props;
      const state = useStore(store);
      const label = t('launcher.title');
      const buttonRef = React.useRef(null);
      const timerRef = React.useRef(null);

      // 悬浮提示：延迟一点再出现，避免鼠标路过时闪烁；提示本体渲染在 shell.overlay，
      // 用按钮的真实位置定位，因此不会被 composer 卡片的 overflow 裁掉。
      const showTip = () => {
        if (timerRef.current) return;
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          const node = buttonRef.current;
          if (!node) return;
          const rect = node.getBoundingClientRect();
          store.set({ tip: { top: rect.top, left: rect.left, width: rect.width } });
        }, 420);
      };
      const hideTip = () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        store.set({ tip: null });
      };
      React.useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      }, []);

      return h(
        'button',
        {
          ref: buttonRef,
          type: 'button',
          'aria-label': t('launcher.label'),
          'aria-expanded': state.open ? 'true' : 'false',
          onClick: () => {
            hideTip();
            store.set({ open: !state.open });
          },
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            padding: 0,
            borderRadius: 8,
            border: '1px solid transparent',
            background: 'transparent',
            color: T.textMuted,
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
          },
          onMouseEnter: (event) => {
            event.currentTarget.style.background = T.surfaceAlt;
            event.currentTarget.style.color = T.text;
            showTip();
          },
          onMouseLeave: (event) => {
            event.currentTarget.style.background = 'transparent';
            event.currentTarget.style.color = T.textMuted;
            hideTip();
          },
          onFocus: showTip,
          onBlur: hideTip,
        },
        h(BankIcon, { size: 17 }),
      );
    }

    /** 悬浮提示气泡：跟随按钮定位，pointer-events:none 不挡交互。 */
    function TipBubble(props) {
      const { store, t } = props;
      const state = useStore(store);
      if (!state.tip) return null;
      const { top, left, width } = state.tip;
      return h(
        'div',
        {
          'aria-hidden': true,
          style: {
            position: 'fixed',
            top: top - 10,
            left: left + width / 2,
            transform: 'translate(-50%, -100%)',
            zIndex: 58,
            pointerEvents: 'none',
            maxWidth: 260,
            padding: '7px 10px',
            borderRadius: 8,
            border: `1px solid ${T.borderStrong}`,
            background: T.surfaceAlt,
            color: T.text,
            boxShadow: '0 8px 22px rgba(0, 0, 0, 0.22)',
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
            opacity: 0,
            animation: 'none',
            transition: 'opacity 140ms ease',
          },
          ref: (node) => {
            if (node) {
              node.style.opacity = '1';
            }
          },
        },
        h('span', { style: { fontWeight: 600 } }, t('launcher.title')),
        h(
          'span',
          { style: { color: T.textMuted, marginLeft: 6 } },
          t('tooltip.hint'),
        ),
      );
    }

    function TabBar(props) {
      const { tab, onChange, t } = props;
      const tabs = [
        { id: 'exam', label: t('panel.tab.exam') },
        { id: 'theory', label: t('panel.tab.theory') },
        { id: 'rules', label: t('panel.tab.rules') },
      ];
      return h(
        'div',
        {
          role: 'tablist',
          style: { display: 'flex', gap: 18, borderBottom: `1px solid ${T.border}`, padding: '0 2px' },
        },
        tabs.map((item) => {
          const active = item.id === tab;
          return h(
            'button',
            {
              key: item.id,
              type: 'button',
              role: 'tab',
              'aria-selected': active ? 'true' : 'false',
              onClick: () => onChange(item.id),
              style: {
                appearance: 'none',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${active ? T.brand : 'transparent'}`,
                color: active ? T.text : T.textMuted,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                lineHeight: 1.4,
                padding: '8px 2px 7px',
                marginBottom: -1,
                cursor: 'pointer',
              },
            },
            item.label,
          );
        }),
      );
    }

    function ExamList(props) {
      const { exams, t } = props;
      if (exams.length === 0) {
        return h('div', { style: { color: T.textMuted, fontSize: 13, padding: '18px 2px' } }, t('panel.exam.empty'));
      }
      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        exams.map((exam) =>
          h(
            'section',
            {
              key: exam.year,
              style: {
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                background: T.surface,
                padding: '10px 12px',
              },
            },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
              h(
                'span',
                {
                  style: {
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.brand,
                    background: T.surfaceAlt,
                    borderRadius: 6,
                    padding: '1px 7px',
                    letterSpacing: '0.02em',
                  },
                },
                exam.year,
              ),
              h('span', { style: { fontSize: 12, color: T.textMuted } }, t('panel.exam.paper')),
            ),
            h(
              'ol',
              { style: { margin: 0, paddingLeft: 18, columns: 2, columnGap: 20 } },
              exam.titles.map((title, index) =>
                h(
                  'li',
                  {
                    key: `${exam.year}-${index}`,
                    style: { fontSize: 13, lineHeight: 1.7, color: T.text, breakInside: 'avoid' },
                  },
                  title,
                ),
              ),
            ),
          ),
        ),
      );
    }

    function TheoryList(props) {
      const { skeletons, t } = props;
      if (skeletons.length === 0) {
        return h('div', { style: { color: T.textMuted, fontSize: 13, padding: '18px 2px' } }, t('panel.searchEmpty'));
      }
      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        skeletons.map((skeleton) =>
          h(
            'section',
            {
              key: skeleton.name,
              style: {
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                background: T.surface,
                padding: '9px 12px',
              },
            },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 } },
              h('span', { style: { fontSize: 13, fontWeight: 600, color: T.text } }, skeleton.name),
              h('span', { style: { fontSize: 11, color: T.textMuted } }, t('panel.theory.points')),
            ),
            h(
              'ul',
              { style: { margin: 0, paddingLeft: 16 } },
              skeleton.points.map((point, index) =>
                h(
                  'li',
                  { key: index, style: { fontSize: 12.5, lineHeight: 1.65, color: T.textMuted } },
                  point,
                ),
              ),
            ),
          ),
        ),
      );
    }

    function RuleList(props) {
      const { rules, t } = props;
      if (rules.length === 0) {
        return h('div', { style: { color: T.textMuted, fontSize: 13, padding: '18px 2px' } }, t('panel.searchEmpty'));
      }
      return h(
        'ol',
        { style: { margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 7 } },
        rules.map((rule, index) =>
          h(
            'li',
            {
              key: index,
              style: {
                fontSize: 13,
                lineHeight: 1.7,
                color: T.text,
                borderLeft: `2px solid ${T.border}`,
                paddingLeft: 10,
              },
            },
            rule,
          ),
        ),
      );
    }

    function TopicBankPanel(props) {
      const { store, t } = props;
      const state = useStore(store);
      const inputRef = React.useRef(null);

      React.useEffect(() => {
        if (!state.open) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            store.set({ open: false });
          }
        };
        document.addEventListener('keydown', onKeyDown);
        const timer = setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 0);
        return () => {
          document.removeEventListener('keydown', onKeyDown);
          clearTimeout(timer);
        };
      }, [state.open, store]);

      if (!state.open) return null;

      const query = state.query.trim().toLowerCase();
      const match = (text) => (query ? String(text).toLowerCase().includes(query) : true);
      const exams = query
        ? EXAMS.map((exam) => ({
            year: exam.year,
            titles: exam.titles.filter(match),
          })).filter((exam) => exam.titles.length > 0)
        : EXAMS;
      const skeletons = query
        ? SKELETONS.map((skeleton) => ({
            name: skeleton.name,
            points: skeleton.points.filter(match),
          })).filter((skeleton) => skeleton.points.length > 0)
        : SKELETONS;
      const rules = query ? RULES.filter(match) : RULES;
      const empty =
        (state.tab === 'exam' && exams.length === 0) ||
        (state.tab === 'theory' && skeletons.length === 0) ||
        (state.tab === 'rules' && rules.length === 0);

      const panelWidth = 'min(92vw, 760px)';

      return h(
        'div',
        {
          style: {
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'rgba(0, 0, 0, 0.32)',
            // shell.overlay 整层 click-through，子元素须自行 opt-in 才能接收指针事件
            pointerEvents: 'auto',
          },
          onClick: (event) => {
            if (event.target === event.currentTarget) store.set({ open: false });
          },
        },
        h(
          'div',
          {
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': t('panel.title'),
            style: {
              width: panelWidth,
              maxHeight: '78vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: T.overlay,
              border: `1px solid ${T.borderStrong}`,
              borderRadius: 14,
              boxShadow: '0 18px 48px rgba(0, 0, 0, 0.28)',
              pointerEvents: 'auto',
            },
          },
          h(
            'header',
            {
              style: {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '16px 18px 12px',
                borderBottom: `1px solid ${T.border}`,
              },
            },
            h(
              'span',
              {
                style: {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: T.surfaceAlt,
                  color: T.brand,
                  flex: 'none',
                },
              },
              h(BankIcon, { size: 17 }),
            ),
            h(
              'div',
              { style: { flex: 1, minWidth: 0 } },
              h(
                'div',
                { style: { fontSize: 15, fontWeight: 600, color: T.text, lineHeight: 1.3 } },
                t('panel.title'),
              ),
              h(
                'div',
                { style: { fontSize: 12, color: T.textMuted, marginTop: 2 } },
                t('panel.subtitle', {
                  years: EXAMS.length,
                  topics: SKELETONS.length,
                  rules: RULES.length,
                }),
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                onClick: () => store.set({ open: false }),
                title: t('panel.close'),
                'aria-label': t('panel.close'),
                style: {
                  appearance: 'none',
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: '1px solid transparent',
                  background: 'transparent',
                  color: T.textMuted,
                  fontSize: 16,
                  lineHeight: '1',
                  cursor: 'pointer',
                  flex: 'none',
                },
                onMouseEnter: (event) => {
                  event.currentTarget.style.background = T.surfaceAlt;
                  event.currentTarget.style.color = T.text;
                },
                onMouseLeave: (event) => {
                  event.currentTarget.style.background = 'transparent';
                  event.currentTarget.style.color = T.textMuted;
                },
              },
              '✕',
            ),
          ),
          h(
            'div',
            { style: { padding: '12px 18px 0' } },
            h('input', {
              ref: inputRef,
              type: 'search',
              value: state.query,
              placeholder: t('panel.search'),
              'aria-label': t('panel.search'),
              onChange: (event) => store.set({ query: event.target.value }),
              style: {
                width: '100%',
                boxSizing: 'border-box',
                fontSize: 13,
                color: T.text,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 9,
                padding: '8px 11px',
                outline: 'none',
              },
            }),
          ),
          h(
            'div',
            { style: { padding: '10px 18px 0' } },
            h(TabBar, {
              tab: state.tab,
              t,
              onChange: (tab) => store.set({ tab }),
            }),
          ),
          h(
            'div',
            {
              style: {
                flex: 1,
                minHeight: 120,
                overflowY: 'auto',
                padding: '12px 18px 16px',
              },
            },
            empty
              ? h('div', { style: { color: T.textMuted, fontSize: 13, padding: '22px 2px' } }, t('panel.searchEmpty'))
              : state.tab === 'exam'
                ? h(ExamList, { exams, t })
                : state.tab === 'theory'
                  ? h(TheoryList, { skeletons, t })
                  : h(RuleList, { rules, t }),
          ),
          h(
            'footer',
            {
              style: {
                padding: '10px 18px',
                borderTop: `1px solid ${T.border}`,
                fontSize: 12,
                color: T.textMuted,
              },
            },
            t('panel.footer'),
          ),
        ),
      );
    }

    /** shell.overlay 层：悬浮提示气泡 + 题库模态卡（两者共用同一个 store）。 */
    function OverlayLayer(props) {
      const { store, t } = props;
      return h(
        React.Fragment,
        null,
        h(TipBubble, { store, t }),
        h(TopicBankPanel, { store, t }),
      );
    }

    return {
      // 只依赖 slots：与 DSH 自带 decoration 模板一致的最小依赖形态，减少激活失败面。
      inject: ['slots'],
      apply(ctx) {
        // 文案：宿主提供 locale 服务时优先走 Client locale 字典（可随语言切换），
        // 否则退回内置中文文案。两种情况都不影响面板渲染。
        const fallback = DICT.zh;
        let t = (key, params) => {
          const template = fallback[key] ?? key;
          if (!params) return template;
          return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
        };
        try {
          if (ctx.locale && typeof ctx.locale.register === 'function') {
            ctx.effect(() => ctx.locale.register(NS, DICT), 'ruankao-essay: locale dictionary');
            t = ctx.locale.bind(NS);
          }
        } catch (error) {
          ctx.logger?.warn?.('ruankao-essay: locale 不可用，使用内置文案：' + String(error));
        }

        const store = createStore();

        // 入口：composer 工具行左侧的紧凑图标按钮（不再占用 composer 下方的环境条目位）。
        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'ruankao-topic-bank',
          order: 10,
          label: t('launcher.title'),
        }, (props) => h(Launcher, { ...props, store, t })));

        // 本体：shell.overlay 里的居中模态卡，遮罩点击或 Esc 关闭。
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'ruankao-topic-bank-panel',
          order: 20,
          label: t('panel.title'),
        }, (props) => h(OverlayLayer, { ...props, store, t })));
      },
    };
  },
});

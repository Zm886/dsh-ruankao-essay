/**
 * Client half: 在 DSH Web UI 的对话区注册一个「软考题库速查」面板。
 *
 * 数据只包含公开内容：历年考试题名、通用理论骨架、写作规格速查。
 * 面板注册在 conversation.composer.dock（已分配空间的槽位），不接管页面根节点。
 */

window.__ModuleLoader__.load({
  id: 'dsh-ruankao-essay',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // ---- 公开数据：历年题名 ----
    const EXAMS = [
      { year: '2026/05', titles: ['信息系统安全保障规划与设计', 'LLM 大模型在软件测试中的应用', '需求评审在软件项目中的应用', '软件架构风格'] },
      { year: '2025/11', titles: ['系统成本效益分析方法', '多种软件设计模式在项目中的应用', '软件测试技术的应用', '云计算运维'] },
      { year: '2025/05', titles: ['信息系统运维管理技术与应用', '软件系统测试方法及应用', '信息系统开发方法及应用', '模型驱动分析方法及应用'] },
      { year: '2024/11', titles: ['静态测试方法及其应用', 'DevOps 在开发时的应用', '业务流程分析方法及其应用', '信息系统运维管理流程'] },
      { year: '2024/05', titles: ['基于架构的软件设计', '性能测试方法及其应用', '多源数据集成方法及其应用', '云原生应用开发'] },
      { year: '2023/05', titles: ['信息系统的可行性分析', 'DevOps 及其应用', '敏捷开发方法（Scrum）', '信息系统数据转换和迁移'] },
      { year: '2022/05', titles: ['原型法及其在信息系统开发中的应用', '面向对象设计方法及其应用'] },
      { year: '2021/05', titles: ['面向对象的信息系统分析方法', '静态测试方法及应用', '富互联网应用的客户端开发技术', 'DevSecOps 技术及其应用'] },
      { year: '2020/11', titles: ['面向服务的信息系统开发方法及其应用', '快速应用开发方法（RAD）及其应用', '软件设计模式及其应用', '遗留系统演化策略及其应用'] },
      { year: '2019/05', titles: ['系统需求分析方法', '系统自动化测试及其应用', '处理流程设计方法及应用', '企业智能运维技术与方法'] },
      { year: '2018/05', titles: ['信息系统开发方法论', '软件构件管理及其应用', '软件系统需求获取技术及应用', '数据挖掘方法及应用'] },
      { year: '2017/05', titles: ['需求分析方法及应用', '企业应用集成', '数据流图在系统分析与设计中的应用', '软件的系统测试及其应用'] },
      { year: '2016/05', titles: ['软件需求验证方法及其应用', '软件的系统测试及其应用', '软件开发模型及应用', '信息系统规划及实践'] },
    ];

    // ---- 公开数据：题型骨架要点（教科书层面的分类清单）----
    const SKELETONS = [
      { name: '软件测试', points: ['系统测试六项内容：功能性／健壮性／性能／界面／安全性／安装与反安装', '静态：桌前检查、代码走查、代码审查', '动态：黑盒（等价类、边界值）＋白盒（语句、判定、条件、路径）', '策略：全过程测试、突出测试重点、测试度量'] },
      { name: '架构风格', points: ['数据流：批处理、管道—过滤器', '调用返回：主程序—子程序、面向对象、层次结构', '独立构件：进程通信、事件驱动', '虚拟机：解释器、基于规则；仓库：数据库、黑板'] },
      { name: 'ABSD', points: ['架构需求 → 架构设计 → 架构文档化 → 架构复审 → 架构实现 → 架构演化'] },
      { name: '微服务', points: ['按业务能力拆分；独立部署、技术异构、故障隔离、按需扩展', '治理：注册配置、网关、限流熔断、链路追踪', '一致性：TCC／本地消息表＋幂等／只读视图'] },
      { name: '企业集成', points: ['界面（页面）／数据（数据访问层）／应用（程序内部结构）／业务流程', '门户、ESB（协议与格式转换、服务路由）、数据总线、数据仓库与集市'] },
      { name: '安全与保密', points: ['网络硬件层：DMZ、防火墙、防毒墙、反向代理、物理隔离、跳板机', '数据层：存储加密、权限细分、全量／增量／差量备份、多机房容灾', '应用层：RBAC、双因素、MD5＋salt、令牌机制'] },
      { name: '容错与避错', points: ['冗余：结构／时间／信息／冗余附加', 'N 版本程序设计、恢复块方法、防卫式程序设计'] },
      { name: '设计模式', points: ['四要素：模式名称、适应场景、解决方案、效果', '三类：创建型 5、结构型 7、行为型 11'] },
      { name: '分布式数据库', points: ['选型 → 设计 → 数据集成 → 测试 → 部署；位置透明；两阶段提交保一致'] },
      { name: '数据挖掘', points: ['KDD：问题定义 → 数据准备 → 建模 → 评估 → 部署 → 维护', '方法：分类、聚类、关联分析（＋回归、序列模式）'] },
      { name: '需求工程', points: ['获取：访谈、问卷、现场观摩、阅读历史文档（各有适用场景）', '分析：数据字典为核心，配合 DFD 与 STD', '管理：变更管理、版本控制、双向跟踪、状态管理'] },
      { name: '过程与项目管理', points: ['过程改进：职责分离、同行与专家评审、版本控制、测试独立', '挣值分析：PV／EV／AC，费用偏差 EV−AC、进度偏差 EV−PV', '甘特图与里程碑；质量计划／保证／控制'] },
      { name: '信息化战略', points: ['信息工程方法（James Martin）＋BSP：企业过程、数据类、过程／数据类矩阵', '数据环境：DB＋ODS＋DW'] },
      { name: '云原生', points: ['原则：服务化、弹性、可观测、韧性、自动化、零信任、持续演进', '模式：服务化、Mesh、Serverless、存储计算分离、分布式事务、可观测、事件驱动'] },
      { name: 'DevSecOps', points: ['在规划／开发／交付／运营四阶段分别嵌入威胁建模、静态扫描、门禁、运行时防护'] },
      { name: '遗留系统演化', points: ['评价：业务价值与技术水准两维', '策略：淘汰／继承／改造／集成', '转换：直接／并行／分段；数据迁移三方法'] },
    ];

    const RULES = [
      '严格 10 段：摘要 → 缘由 → 概况与技术 → 回应子题目 2 → 正文 3 段 → 问题与效果 → 收尾',
      '字数按含标点核对，2500~2800',
      '不写标题、不写「摘要／背景／子题目」字眼、不用「第一／首先／一是」式分点',
      '全文无第一人称（首段身份交代除外）；建设期只写在首段',
      '每个论点配一条项目真实业务实例；效果给量化数据；收尾 2~3 条不足与改进',
    ];

    const surface = 'rgba(127,127,127,0.10)';
    const border = '1px solid rgba(127,127,127,0.28)';

    function TopicBank() {
      const [open, setOpen] = React.useState(false);
      const [tab, setTab] = React.useState('exam');
      const box = { maxHeight: '42vh', overflow: 'auto', padding: '8px 10px', border: border, borderRadius: 8, marginTop: 6, background: surface, fontSize: 13, lineHeight: 1.55 };
      const chip = { padding: '2px 8px', border: border, borderRadius: 999, background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 12, marginRight: 6 };
      const chipOn = { ...chip, background: 'rgba(127,127,127,0.22)', fontWeight: 600 };

      const body = tab === 'exam'
        ? h('div', null,
            EXAMS.map((e) => h('div', { key: e.year, style: { marginBottom: 6 } },
              h('span', { style: { fontWeight: 600, marginRight: 6 } }, e.year),
              h('span', null, e.titles.join('；'))
            ))
          )
        : tab === 'theory'
          ? h('div', null,
              SKELETONS.map((s) => h('div', { key: s.name, style: { marginBottom: 8 } },
                h('div', { style: { fontWeight: 600 } }, s.name),
                h('ul', { style: { margin: '2px 0 0 18px', padding: 0 } }, s.points.map((p, i) => h('li', { key: i }, p)))
              ))
            )
          : h('ul', { style: { margin: 0, paddingLeft: 18 } }, RULES.map((r, i) => h('li', { key: i, style: { marginBottom: 4 } }, r)));

      return h('div', { style: { fontSize: 13, color: 'inherit' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
          h('button', {
            type: 'button',
            onClick: () => setOpen(!open),
            style: { ...chip, marginRight: 0 },
            title: '软考系分论文题库速查',
          }, (open ? '收起题库' : '题库速查') + ' · ' + EXAMS.length + ' 年'),
          h('span', { style: { opacity: 0.7, fontSize: 12 } }, '真题题名 / 题型骨架 / 写作规格')
        ),
        open && h('div', { style: box },
          h('div', { style: { marginBottom: 6 } },
            h('button', { type: 'button', style: tab === 'exam' ? chipOn : chip, onClick: () => setTab('exam') }, '历年真题'),
            h('button', { type: 'button', style: tab === 'theory' ? chipOn : chip, onClick: () => setTab('theory') }, '题型骨架'),
            h('button', { type: 'button', style: tab === 'rules' ? chipOn : chip, onClick: () => setTab('rules') }, '写作规格')
          ),
          body
        )
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'ruankao-topic-bank',
          order: 6,
        }, TopicBank));
      },
    };
  },
});

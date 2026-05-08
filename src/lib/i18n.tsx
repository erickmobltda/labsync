import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'pt-BR' | 'en'

const STORAGE_KEY = 'labsync.lang'
const DEFAULT_LANG: Language = 'pt-BR'

const dictionaries: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Common
    'common.signIn': 'Entrar',
    'common.signOut': 'Sair',
    'common.upload': 'Enviar',
    'common.uploadNew': 'Enviar novo',
    'common.uploadReport': 'Enviar relatório',
    'common.uploadFirstReport': 'Enviar primeiro relatório',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'common.saving': 'Salvando…',
    'common.loading': 'Carregando…',
    'common.delete': 'Excluir',
    'common.back': 'Voltar',
    'common.from': 'De',
    'common.to': 'Até',
    'common.clearDates': 'Limpar datas',
    'common.normal': 'Normal',
    'common.high': 'Alto',
    'common.low': 'Baixo',
    'common.unknown': 'Desconhecido',
    'common.improving': 'Melhorando',
    'common.worsening': 'Piorando',
    'common.min': 'Mín',
    'common.max': 'Máx',
    'common.ref': 'Ref',
    'common.measurements': 'medições',
    'common.biomarkers': 'biomarcadores',
    'common.biomarker': 'Biomarcador',
    'common.value': 'Valor',
    'common.unit': 'Unidade',
    'common.reference': 'Referência',
    'common.status': 'Status',
    'common.category': 'Categoria',
    'common.languageLabel': 'Idioma',

    // Status (DB values)
    'status.normal': 'Normal',
    'status.high': 'Alto',
    'status.low': 'Baixo',
    'status.unknown': 'Desconhecido',

    // Categories (DB values)
    'category.Lipid Profile': 'Perfil Lipídico',
    'category.Metabolic Panel': 'Painel Metabólico',
    'category.Blood Count': 'Hemograma',
    'category.Liver Function': 'Função Hepática',
    'category.Thyroid': 'Tireoide',
    'category.Vitamins & Minerals': 'Vitaminas e Minerais',
    'category.Inflammation': 'Inflamação',
    'category.Hormones': 'Hormônios',
    'category.Other': 'Outros',
    'category.All': 'Todos',

    // Sidebar
    'nav.dashboard': 'Painel',
    'nav.upload': 'Enviar relatório',
    'nav.reports': 'Meus relatórios',
    'nav.appointments': 'Consultas',
    'nav.medicines': 'Medicamentos',

    // Header / brand
    'brand.tagline': 'Inteligência de exames de sangue',

    // Landing
    'landing.signInBtn': 'Entrar',
    'landing.getStartedFree': 'Comece grátis',
    'landing.heroTitleA': 'Seus dados de saúde,',
    'landing.heroTitleB': 'lindamente organizados',
    'landing.heroSubtitle': 'Envie qualquer PDF de exame de sangue e veja instantaneamente as tendências dos seus biomarcadores ao longo do tempo — com indicadores de status, agrupamento por categoria e gráficos interativos.',
    'landing.startForFree': 'Começar grátis',
    'landing.seeDemo': 'Ver demo →',
    'landing.featuresTitle': 'Tudo que você precisa para entender sua saúde',
    'landing.feat.smartUpload.title': 'Envio inteligente',
    'landing.feat.smartUpload.desc': 'Solte um PDF ou cole o texto. Nossa IA extrai cada biomarcador automaticamente.',
    'landing.feat.trend.title': 'Acompanhamento de tendências',
    'landing.feat.trend.desc': 'Gráficos interativos mostram como seus valores mudam ao longo do tempo, por categoria.',
    'landing.feat.private.title': 'Privado e seguro',
    'landing.feat.private.desc': 'Seus dados são criptografados e isolados por linha — somente você pode vê-los.',
    'landing.feat.anyLab.title': 'Qualquer formato de laboratório',
    'landing.feat.anyLab.desc': 'Funciona com relatórios de qualquer laboratório, em todo o mundo.',
    'landing.feat.categorical.title': 'Visualizações por categoria',
    'landing.feat.categorical.desc': 'Lipídios, hemograma, tireoide, vitaminas — agrupados de forma inteligente.',
    'landing.feat.insights.title': 'Insights instantâneos',
    'landing.feat.insights.desc': 'Indicadores de status destacam valores altos, baixos e normais num piscar de olhos.',
    'landing.ctaTitle': 'Tenha controle dos seus dados de saúde',
    'landing.ctaSubtitle': 'De graça. Sem cartão de crédito. Seus dados continuam sendo seus.',
    'landing.ctaButton': 'Comece — é grátis',
    'landing.footerLine1': 'LabSync é apenas uma ferramenta de consolidação de dados. Não é aconselhamento médico ou diagnóstico.',

    // Login
    'login.welcome': 'Bem-vindo ao LabSync',
    'login.subtitle': 'Seu painel pessoal de exames de sangue',
    'login.cardTitle': 'Entrar',
    'login.cardSubtitle': 'Sem senha — enviaremos um link seguro por e-mail.',
    'login.magicTitle': 'Entrar com link mágico',
    'login.magicSubtitle': 'Enviaremos um link seguro por e-mail — sem senha.',
    'login.passwordTitle': 'Bem-vindo',
    'login.passwordSubtitle': 'Entre ou crie uma conta para continuar.',
    'login.useMagicInstead': 'Usar link mágico',
    'login.usePasswordInstead': 'Usar e-mail e senha',
    'login.feat.upload': 'Envie PDF ou cole texto de qualquer relatório',
    'login.feat.trends': 'Acompanhe tendências de biomarcadores com gráficos interativos',
    'login.feat.private': 'Seus dados são privados e criptografados',

    // Magic link form
    'magic.emailLabel': 'Endereço de e-mail',
    'magic.placeholder': 'voce@exemplo.com',
    'magic.sending': 'Enviando...',
    'magic.send': 'Enviar link mágico',
    'magic.sentTitle': 'Verifique seu e-mail',
    'magic.sentBody': 'Enviamos um link mágico para {email}. Clique no link para entrar.',
    'magic.useDifferent': 'Usar outro e-mail',
    'magic.failed': 'Falha ao enviar o link',

    // Auth callback
    'authcb.signing': 'Entrando…',
    'authcb.success': 'Você está dentro!',
    'authcb.successSub': 'Redirecionando para seu painel…',
    'authcb.failed': 'Falha ao entrar',
    'authcb.backToLogin': 'Voltar ao login',
    'authcb.noSession': 'Nenhuma sessão encontrada. O link pode ter expirado.',

    // Dashboard
    'dash.title': 'Painel de saúde',
    'dash.tracked': '{count} biomarcadores acompanhados',
    'dash.empty': 'Sem dados ainda — envie seu primeiro relatório',
    'dash.view.cards': 'Cartões',
    'dash.view.grouped': 'Agrupado',
    'dash.view.charts': 'Gráficos',
    'dash.noData': 'Nenhum dado para exibir',
    'dash.adjustFilters': 'Tente ajustar seus filtros ou intervalo de datas.',
    'dash.uploadFirst': 'Envie seu primeiro relatório de exame para começar a acompanhar suas tendências de saúde.',

    // Insights
    'insights.needsAttention': 'Precisa de atenção',
    'insights.allNormal': 'Todos os biomarcadores com faixas de referência estão dentro dos limites normais.',
    'insights.withoutRef': '{count} sem faixa de referência',
    'insights.total': '{count} no total',

    // Search
    'search.placeholder': 'Buscar biomarcadores…',

    // Category card
    'group.outOfRange': '{count} fora da faixa',
    'group.biomarkersCount': '{count} biomarcadores',

    // Chart
    'chart.onlyOne': 'Apenas uma medição — envie mais relatórios para ver tendências',

    // Upload page
    'upload.title': 'Enviar relatório de exame',
    'upload.subtitle': 'Envie um PDF ou cole o texto — extrairemos e estruturaremos seus biomarcadores automaticamente.',
    'upload.analyzing': 'Analisando seu relatório…',
    'upload.claudeExtracting': 'Claude está extraindo seus biomarcadores',
    'upload.tipsTitle': 'Dicas para melhores resultados',
    'upload.tip1': 'Use o PDF original do seu laboratório, não uma foto digitalizada',
    'upload.tip2': 'Relatórios com tabelas bem formatadas são extraídos com mais precisão',
    'upload.tip3': 'Você pode revisar e confirmar os dados extraídos antes de salvar',
    'upload.tip4': 'Suportado: hemograma completo, perfil lipídico, painel metabólico, tireoide, vitaminas e mais',
    'upload.savedSuccess': 'Relatório salvo com sucesso!',
    'upload.savedFailed': 'Falha ao salvar relatório',
    'upload.extractFailed': 'Falha na extração',
    'upload.saveFailed': 'Falha ao salvar',

    // Upload zone
    'zone.pasteLabel': 'Cole o texto do seu relatório',
    'zone.pastePlaceholder': 'Cole os resultados do seu exame de sangue aqui…\n\nExemplo:\nGlicose: 95 mg/dL (70-100)\nHbA1c: 5.4% (<5.7)\nColesterol total: 185 mg/dL (<200)',
    'zone.extractBtn': 'Extrair biomarcadores',
    'zone.dropHint': 'Solte seu PDF aqui ou clique para procurar',
    'zone.fileLimit': 'Apenas arquivos PDF · Máx 10 MB',
    'zone.or': 'ou',
    'zone.pasteManually': 'Colar texto do relatório manualmente',

    // Extraction preview
    'preview.extracted': 'Extraídos {count} biomarcadores',
    'preview.normalCount': '{count} Normal',
    'preview.highCount': '{count} Alto',
    'preview.lowCount': '{count} Baixo',
    'preview.reportDate': 'Data do relatório',
    'preview.saveToDashboard': 'Salvar no painel',
    'preview.uploadDifferent': 'Enviar outro relatório',

    // Reports list
    'reports.title': 'Meus relatórios',
    'reports.countOne': '{count} relatório enviado',
    'reports.countMany': '{count} relatórios enviados',
    'reports.none': 'Nenhum relatório ainda',
    'reports.emptyTitle': 'Nenhum relatório ainda',
    'reports.emptySub': 'Envie seu primeiro relatório de exame para começar.',
    'reports.pastedText': 'Relatório de texto colado',
    'reports.reportDate': 'Data do relatório: {date}',
    'reports.added': 'Adicionado em {date}',
    'reports.deleteConfirm': 'Excluir este relatório e todos os seus biomarcadores?',

    // Report detail
    'detail.title': 'Detalhe do relatório',
    'detail.viewPdf': 'Ver PDF',
    'detail.download': 'Baixar',
    'detail.reportDate': 'Data do relatório: {date}',
    'detail.biomarkersCount': '{count} biomarcadores',
    'detail.loadPdfFailed': 'Falha ao carregar PDF',

    // Disclaimer
    'disclaimer.label': 'Aviso médico:',
    'disclaimer.body': 'O LabSync é uma ferramenta de consolidação de dados apenas para referência pessoal. As visualizações e dados exibidos não constituem aconselhamento médico, diagnóstico ou tratamento. Sempre consulte um profissional de saúde qualificado em relação a quaisquer preocupações médicas.',
  },
  en: {
    'common.signIn': 'Sign in',
    'common.signOut': 'Sign out',
    'common.upload': 'Upload',
    'common.uploadNew': 'Upload New',
    'common.uploadReport': 'Upload Report',
    'common.uploadFirstReport': 'Upload First Report',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.saving': 'Saving…',
    'common.loading': 'Loading…',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.from': 'From',
    'common.to': 'To',
    'common.clearDates': 'Clear dates',
    'common.normal': 'Normal',
    'common.high': 'High',
    'common.low': 'Low',
    'common.unknown': 'Unknown',
    'common.improving': 'Improving',
    'common.worsening': 'Worsening',
    'common.min': 'Min',
    'common.max': 'Max',
    'common.ref': 'Ref',
    'common.measurements': 'measurements',
    'common.biomarkers': 'biomarkers',
    'common.biomarker': 'Biomarker',
    'common.value': 'Value',
    'common.unit': 'Unit',
    'common.reference': 'Reference',
    'common.status': 'Status',
    'common.category': 'Category',
    'common.languageLabel': 'Language',

    'status.normal': 'Normal',
    'status.high': 'High',
    'status.low': 'Low',
    'status.unknown': 'Unknown',

    'category.Lipid Profile': 'Lipid Profile',
    'category.Metabolic Panel': 'Metabolic Panel',
    'category.Blood Count': 'Blood Count',
    'category.Liver Function': 'Liver Function',
    'category.Thyroid': 'Thyroid',
    'category.Vitamins & Minerals': 'Vitamins & Minerals',
    'category.Inflammation': 'Inflammation',
    'category.Hormones': 'Hormones',
    'category.Other': 'Other',
    'category.All': 'All',

    'nav.dashboard': 'Dashboard',
    'nav.upload': 'Upload Report',
    'nav.reports': 'My Reports',
    'nav.appointments': 'Appointments',
    'nav.medicines': 'Medicines',

    'brand.tagline': 'Blood test intelligence',

    'landing.signInBtn': 'Sign in',
    'landing.getStartedFree': 'Get started free',
    'landing.heroTitleA': 'Your health data,',
    'landing.heroTitleB': 'beautifully organized',
    'landing.heroSubtitle': 'Upload any blood test PDF and instantly see your biomarker trends over time — with status indicators, category grouping, and interactive charts.',
    'landing.startForFree': 'Start for free',
    'landing.seeDemo': 'See a demo →',
    'landing.featuresTitle': 'Everything you need to understand your health',
    'landing.feat.smartUpload.title': 'Smart Upload',
    'landing.feat.smartUpload.desc': 'Drop a PDF or paste text. Our AI extracts every biomarker automatically.',
    'landing.feat.trend.title': 'Trend Tracking',
    'landing.feat.trend.desc': 'Interactive charts show how your values change over time, by category.',
    'landing.feat.private.title': 'Private & Secure',
    'landing.feat.private.desc': 'Your data is encrypted and row-level isolated — only you can see it.',
    'landing.feat.anyLab.title': 'Any Lab Format',
    'landing.feat.anyLab.desc': 'Works with reports from any laboratory, worldwide.',
    'landing.feat.categorical.title': 'Categorical Views',
    'landing.feat.categorical.desc': 'Lipid Panel, Blood Count, Thyroid, Vitamins — grouped intelligently.',
    'landing.feat.insights.title': 'Instant Insights',
    'landing.feat.insights.desc': 'Status indicators highlight high, low, and normal values at a glance.',
    'landing.ctaTitle': 'Take control of your health data',
    'landing.ctaSubtitle': 'Free to use. No credit card required. Your data stays yours.',
    'landing.ctaButton': "Get started — it's free",
    'landing.footerLine1': 'LabSync is a data consolidation tool only. Not medical advice or diagnosis.',

    'login.welcome': 'Welcome to LabSync',
    'login.subtitle': 'Your personal blood test dashboard',
    'login.cardTitle': 'Sign in',
    'login.cardSubtitle': "No password required — we'll email you a secure link.",
    'login.magicTitle': 'Magic link sign-in',
    'login.magicSubtitle': "We'll email you a secure link — no password needed.",
    'login.passwordTitle': 'Welcome',
    'login.passwordSubtitle': 'Sign in or create an account to continue.',
    'login.useMagicInstead': 'Use a magic link instead',
    'login.usePasswordInstead': 'Use email & password instead',
    'login.feat.upload': 'Upload PDF or paste text from any lab report',
    'login.feat.trends': 'Track biomarker trends with interactive charts',
    'login.feat.private': 'Your data is private and encrypted',

    'magic.emailLabel': 'Email address',
    'magic.placeholder': 'you@example.com',
    'magic.sending': 'Sending...',
    'magic.send': 'Send Magic Link',
    'magic.sentTitle': 'Check your email',
    'magic.sentBody': 'We sent a magic link to {email}. Click the link to sign in.',
    'magic.useDifferent': 'Use a different email',
    'magic.failed': 'Failed to send link',

    'authcb.signing': 'Signing you in…',
    'authcb.success': "You're in!",
    'authcb.successSub': 'Redirecting to your dashboard…',
    'authcb.failed': 'Sign-in failed',
    'authcb.backToLogin': 'Back to Login',
    'authcb.noSession': 'No session found. The link may have expired.',

    'dash.title': 'Health Dashboard',
    'dash.tracked': '{count} biomarkers tracked',
    'dash.empty': 'No data yet — upload your first report',
    'dash.view.cards': 'Cards',
    'dash.view.grouped': 'Grouped',
    'dash.view.charts': 'Charts',
    'dash.noData': 'No data to display',
    'dash.adjustFilters': 'Try adjusting your filters or date range.',
    'dash.uploadFirst': 'Upload your first blood test report to start tracking your health trends.',

    'insights.needsAttention': 'Needs Attention',
    'insights.allNormal': 'All biomarkers with reference ranges are within normal limits.',
    'insights.withoutRef': '{count} without reference range',
    'insights.total': '{count} total',

    'search.placeholder': 'Search biomarkers…',

    'group.outOfRange': '{count} out of range',
    'group.biomarkersCount': '{count} biomarkers',

    'chart.onlyOne': 'Only one measurement — upload more reports to see trends',

    'upload.title': 'Upload Lab Report',
    'upload.subtitle': "Upload a PDF or paste text — we'll extract and structure your biomarkers automatically.",
    'upload.analyzing': 'Analyzing your report…',
    'upload.claudeExtracting': 'Claude is extracting your biomarkers',
    'upload.tipsTitle': 'Tips for best results',
    'upload.tip1': 'Use the original PDF from your laboratory, not a scanned photo',
    'upload.tip2': 'Reports with clear table formatting extract most accurately',
    'upload.tip3': 'You can review and confirm the extracted data before saving',
    'upload.tip4': 'Supported: complete blood count, lipid panel, metabolic panel, thyroid, vitamins, and more',
    'upload.savedSuccess': 'Report saved successfully!',
    'upload.savedFailed': 'Failed to save report',
    'upload.extractFailed': 'Extraction failed',
    'upload.saveFailed': 'Save failed',

    'zone.pasteLabel': 'Paste your lab report text',
    'zone.pastePlaceholder': 'Paste your blood test results here…\n\nExample:\nGlucose: 95 mg/dL (70-100)\nHbA1c: 5.4% (<5.7)\nTotal Cholesterol: 185 mg/dL (<200)',
    'zone.extractBtn': 'Extract Biomarkers',
    'zone.dropHint': 'Drop your PDF here or click to browse',
    'zone.fileLimit': 'PDF files only · Max 10 MB',
    'zone.or': 'or',
    'zone.pasteManually': 'Paste report text manually',

    'preview.extracted': 'Extracted {count} biomarkers',
    'preview.normalCount': '{count} Normal',
    'preview.highCount': '{count} High',
    'preview.lowCount': '{count} Low',
    'preview.reportDate': 'Report date',
    'preview.saveToDashboard': 'Save to Dashboard',
    'preview.uploadDifferent': 'Upload different report',

    'reports.title': 'My Reports',
    'reports.countOne': '{count} report uploaded',
    'reports.countMany': '{count} reports uploaded',
    'reports.none': 'No reports yet',
    'reports.emptyTitle': 'No reports yet',
    'reports.emptySub': 'Upload your first blood test report to get started.',
    'reports.pastedText': 'Pasted text report',
    'reports.reportDate': 'Report date: {date}',
    'reports.added': 'Added {date}',
    'reports.deleteConfirm': 'Delete this report and all its biomarkers?',

    'detail.title': 'Report Detail',
    'detail.viewPdf': 'View PDF',
    'detail.download': 'Download',
    'detail.reportDate': 'Report date: {date}',
    'detail.biomarkersCount': '{count} biomarkers',
    'detail.loadPdfFailed': 'Failed to load PDF',

    'disclaimer.label': 'Medical Disclaimer:',
    'disclaimer.body': 'LabSync is a data consolidation tool for personal reference only. The visualizations and data displayed do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any medical concerns.',
  },
}

const localeMap: Record<Language, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
}

interface I18nContextValue {
  lang: Language
  setLang: (l: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  locale: string
  formatDate: (dateStr: string) => string
  formatDateShort: (dateStr: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function readStoredLang(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'pt-BR' || stored === 'en') return stored
  return DEFAULT_LANG
}

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readStoredLang)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.lang = lang
    }
  }, [lang])

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[lang]
    const locale = localeMap[lang]
    const t = (key: string, vars?: Record<string, string | number>) => {
      const raw = dict[key] ?? dictionaries.en[key] ?? key
      return interpolate(raw, vars)
    }
    const toDate = (dateStr: string) =>
      new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
    const formatDate = (dateStr: string) =>
      toDate(dateStr).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    const formatDateShort = (dateStr: string) =>
      toDate(dateStr).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      })
    return { lang, setLang: setLangState, t, locale, formatDate, formatDateShort }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used within I18nProvider')
  return ctx
}

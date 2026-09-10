"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  BarChart3, Calendar, ChevronLeft, ChevronRight, Download, FolderOpen,
  Image as ImageIcon, LayoutDashboard, Layers, Palette, Plus, Search,
  Settings, Sparkles, Trash2, WandSparkles, Zap, Check, CreditCard,
  Users, SlidersHorizontal, Save, Type, AlignCenter, AlignLeft, AlignRight,
  RefreshCw, Eye, EyeOff, Lock, Unlock, Copy, Scissors, RotateCcw,
  ZoomIn, ZoomOut, Move, Maximize2, ChevronDown, ChevronUp, Star,
  TrendingUp, Hash, Globe, Flame, Bell, LogOut, User, X, ArrowRight,
  Bold, Italic, Underline, Strikethrough, List, Grid, Menu, Play,
  Package, Filter, MoreHorizontal, ExternalLink, Upload, Crop, Sliders
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TextLayer = {
  id: string; type: "text"; text: string; x: number; y: number;
  width: number; height: number; fontSize: number; fontFamily: string;
  fontWeight: "400"|"600"|"700"|"800"|"900"; fontStyle: "normal"|"italic";
  textDecoration: "none"|"underline"; color: string; align: "left"|"center"|"right";
  lineHeight: number; letterSpacing: number; visible: boolean; locked: boolean;
  zIndex: number;
};
type ImageLayer = {
  id: string; type: "image"; src: string; x: number; y: number;
  width: number; height: number; opacity: number; borderRadius: number;
  visible: boolean; locked: boolean; zIndex: number;
  filter: { brightness: number; contrast: number; saturation: number; blur: number };
};
type ShapeLayer = {
  id: string; type: "shape"; shape: "rect"|"circle"|"line";
  x: number; y: number; width: number; height: number;
  fill: string; stroke: string; strokeWidth: number;
  borderRadius: number; visible: boolean; locked: boolean; zIndex: number;
};
type Layer = TextLayer | ImageLayer | ShapeLayer;

type SlideBackground = {
  type: "solid"|"gradient"|"image";
  color: string;
  gradient: { from: string; to: string; angle: number; type: "linear"|"radial" };
  imageSrc?: string;
};
type Slide = {
  id: string; background: SlideBackground; layers: Layer[];
  imagePrompt?: string;
};

type Project = {
  id: string; title: string; status: "Rascunho"|"Pronto"|"Agendado"|"Publicado";
  updated: string; thumbnail?: string; slides: Slide[]; folderId?: string;
  tags?: string[];
};
type Folder = { id: string; name: string; color: string };
type Member = { id: string; name: string; email: string; role: "Admin"|"Editor"|"Viewer"; avatar: string };
type AuthUser = { id: string; name: string; email: string; plan: "Start"|"Creator"|"Studio"; credits: number; avatar: string } | null;

type SlideScript = {
  index: number;
  kicker: string;
  title: string;
  body: string;
  imagePrompt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const FONTS = ["Inter","Arial","Georgia","Bebas Neue","Montserrat","Playfair Display","Oswald","Raleway","Roboto Condensed","Impact"];
const SLIDE_W = 1080; const SLIDE_H = 1350;

// ─── Template Definitions ─────────────────────────────────────────────────────
const TEMPLATES = [
  { id:"viral-dark", name:"Viral Dark", category:"Trending", thumb:"linear-gradient(135deg,#0f0c1a,#1a0a2e)", accent:"#ff6b27",
    desc:"Tipografia bold em fundo escuro — stop-scroll garantido",
    bgColor:"#0f0c1a", gradFrom:"#0f0c1a", gradTo:"#1a0a2e",
    kicker:"VOCÊ PRECISA VER ISSO", title:"O Segredo que\nninguém te conta", body:"Descubra como os maiores criadores do Instagram multiplicam seu alcance sem gastar nada.",
    kickerColor:"#ff6b27", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.7)" },
  { id:"warm-minimal", name:"Warm Minimal", category:"Editorial", thumb:"linear-gradient(135deg,#fef6f0,#ffe8d6)", accent:"#e8431e",
    desc:"Clean e elegante — perfeito para educação e lifestyle",
    bgColor:"#fef6f0", gradFrom:"#fef6f0", gradTo:"#ffe8d6",
    kicker:"GUIA PRÁTICO", title:"7 Passos para\nTransformar sua Presença", body:"Estratégias simples que você pode aplicar hoje mesmo.",
    kickerColor:"#e8431e", titleColor:"#1a0f0a", bodyColor:"#5c3d2e" },
  { id:"neon-pop", name:"Neon Pop", category:"Impacto", thumb:"linear-gradient(135deg,#040d21,#0d1b3e)", accent:"#00f5ff",
    desc:"Cores neon vibrantes — para temas de tecnologia e inovação",
    bgColor:"#040d21", gradFrom:"#040d21", gradTo:"#0d1b3e",
    kicker:"TECNOLOGIA", title:"A IA que está\nMudando Tudo", body:"Como a inteligência artificial está revolucionando o modo como trabalhamos e criamos.",
    kickerColor:"#00f5ff", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.65)" },
  { id:"creator-bold", name:"Creator Bold", category:"Trending", thumb:"linear-gradient(135deg,#ff4500,#ff8c00)", accent:"#fff200",
    desc:"Amarelo e laranja — energético, direto e altamente viral",
    bgColor:"#ff4500", gradFrom:"#ff4500", gradTo:"#ff8c00",
    kicker:"CREATOR TIP", title:"Por que 99% dos\nCarrosséis Falham", body:"E o que você pode fazer diferente para dominar o algoritmo do Instagram.",
    kickerColor:"#fff200", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.85)" },
  { id:"gradient-flow", name:"Gradient Flow", category:"Premium", thumb:"linear-gradient(105deg,#c62283,#ee263d,#ff6a2b)", accent:"#ffffff",
    desc:"Gradiente vibrante rosa-vermelho-laranja — icônico e premium",
    bgColor:"#c62283", gradFrom:"#c62283", gradTo:"#ff6a2b",
    kicker:"TRANSFORMAÇÃO", title:"Do Zero ao\nPerfil Viral", body:"A jornada completa para construir uma audiência engajada e monetizada.",
    kickerColor:"rgba(255,255,255,0.9)", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.75)" },
  { id:"clean-white", name:"Clean White", category:"Editorial", thumb:"linear-gradient(135deg,#ffffff,#f8f8f8)", accent:"#d62678",
    desc:"Fundo branco com acentos coloridos — profissional e legível",
    bgColor:"#ffffff", gradFrom:"#ffffff", gradTo:"#fafafa",
    kicker:"MARKETING", title:"A Fórmula do\nConteúdo que Vende", body:"Princípios que toda marca de sucesso usa para converter seguidores em clientes.",
    kickerColor:"#d62678", titleColor:"#1a1a2e", bodyColor:"#555577" },
  { id:"dark-purple", name:"Dark Purple", category:"Premium", thumb:"linear-gradient(135deg,#1a0a2e,#2d1b69)", accent:"#bf5af2",
    desc:"Roxo escuro luxuoso — para branding premium e alto engajamento",
    bgColor:"#1a0a2e", gradFrom:"#1a0a2e", gradTo:"#2d1b69",
    kicker:"PREMIUM", title:"Estratégias de\nElite para Criadores", body:"Os métodos usados pelos 1% dos criadores para escalar sua presença digital.",
    kickerColor:"#bf5af2", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.7)" },
  { id:"instagram-story", name:"Instagram Story", category:"Social", thumb:"linear-gradient(180deg,#833ab4,#fd1d1d,#fcb045)", accent:"#ffffff",
    desc:"Paleta oficial do Instagram — familiar e altamente compartilhável",
    bgColor:"#833ab4", gradFrom:"#833ab4", gradTo:"#fcb045",
    kicker:"TRENDING NOW", title:"O Conteúdo que\nEstá Bombando", body:"Veja o que está gerando mais engajamento agora mesmo no Instagram.",
    kickerColor:"rgba(255,255,255,0.9)", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.8)" },
  { id:"educational", name:"Educacional", category:"Educação", thumb:"linear-gradient(135deg,#1e3a5f,#2e86ab)", accent:"#4ecdc4",
    desc:"Azul escuro e ciano — credibilidade para conteúdo educativo",
    bgColor:"#1e3a5f", gradFrom:"#1e3a5f", gradTo:"#2e86ab",
    kicker:"VOCÊ SABIA?", title:"Tudo Que Você\nNão Sabia Sobre", body:"Conhecimento que vai mudar a forma como você enxerga o seu mercado.",
    kickerColor:"#4ecdc4", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.7)" },
  { id:"venda-oferta", name:"Venda & Oferta", category:"Vendas", thumb:"linear-gradient(135deg,#d62678,#ff4500)", accent:"#fff200",
    desc:"Rosa-vermelho chamativo — conversão máxima para ofertas",
    bgColor:"#d62678", gradFrom:"#d62678", gradTo:"#ff4500",
    kicker:"OFERTA ESPECIAL", title:"Última Chance\nde Garantir", body:"Vagas limitadas. Aproveite agora antes que acabe.",
    kickerColor:"#fff200", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.85)" },
  { id:"motivacional", name:"Motivacional", category:"Lifestyle", thumb:"linear-gradient(135deg,#2c3e50,#3498db)", accent:"#f39c12",
    desc:"Azul slate e dourado — inspirador e atemporal",
    bgColor:"#2c3e50", gradFrom:"#2c3e50", gradTo:"#3498db",
    kicker:"INSPIRE-SE", title:"A Única Coisa que\nSepara Você do Sucesso", body:"Mentalidade, consistência e foco. Não existe outro caminho.",
    kickerColor:"#f39c12", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.7)" },
  { id:"news-trend", name:"News & Trend", category:"Notícias", thumb:"linear-gradient(135deg,#1a1a1a,#333333)", accent:"#ff3b30",
    desc:"Preto e vermelho — jornalístico, urgente, stop-scroll",
    bgColor:"#1a1a1a", gradFrom:"#1a1a1a", gradTo:"#2c2c2c",
    kicker:"BREAKING", title:"A Notícia que\nEstá Abalando o Mercado", body:"O que está acontecendo agora e como isso vai impactar você.",
    kickerColor:"#ff3b30", titleColor:"#ffffff", bodyColor:"rgba(255,255,255,0.7)" },
];

const TRENDINGS = [
  { id:"t1", title:"Claude Fable 5 virou alvo de censura nos EUA", category:"IA", time:"2h", hot:true, views:"127k" },
  { id:"t2", title:"O segredo do conteúdo em 1 hora com IA", category:"Marketing", time:"4h", hot:true, views:"89k" },
  { id:"t3", title:"A verdade oculta do crescimento de perfis de IA", category:"Growth", time:"6h", hot:false, views:"54k" },
  { id:"t4", title:"iPhone no iOS 27 com Liquid Glass", category:"Tech", time:"8h", hot:true, views:"203k" },
  { id:"t5", title:"Por que o Google Nano Banana está falhando", category:"Tech", time:"10h", hot:false, views:"31k" },
  { id:"t6", title:"Como ganhar R$10k por mês no Instagram em 2026", category:"Negócios", time:"12h", hot:true, views:"178k" },
  { id:"t7", title:"O fim das hashtags: o que realmente funciona agora", category:"Instagram", time:"14h", hot:false, views:"44k" },
  { id:"t8", title:"Limitações internas do Claude Code — o problema com IA", category:"IA", time:"16h", hot:true, views:"67k" },
  { id:"t9", title:"Anthropic libera IA de 10B parâmetros gratuita", category:"IA", time:"18h", hot:true, views:"312k" },
  { id:"t10", title:"Roubrick solta novo Claude que escreve código sozinho", category:"IA", time:"20h", hot:false, views:"28k" },
  { id:"t11", title:"Como usar o Claude Code no Instagram para crescer", category:"Marketing", time:"22h", hot:false, views:"19k" },
  { id:"t12", title:"Boris Cherny do Claude Code no Acquired Unplugged", category:"Tech", time:"1d", hot:false, views:"14k" },
];

const NAV_ITEMS = [
  ["dashboard","Dashboard",LayoutDashboard],
  ["studio","Studio",WandSparkles],
  ["templates","Templates",Palette],
  ["trendings","Trendings",TrendingUp],
  ["organizacao","Organização",FolderOpen],
  ["calendario","Calendário",Calendar],
  ["members","Members",Users],
  ["configuracoes","Configurações",Settings],
] as const;

// ─── Utility functions ────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2,10); }
function makeSlideFromTemplate(tpl: typeof TEMPLATES[0]): Slide {
  const layers: Layer[] = [
    { id:uid(), type:"text", text:tpl.kicker, x:60, y:80, width:400, height:50,
      fontSize:14, fontFamily:"Inter", fontWeight:"800", fontStyle:"normal",
      textDecoration:"none", color:tpl.kickerColor, align:"left",
      lineHeight:1.2, letterSpacing:3, visible:true, locked:false, zIndex:1 },
    { id:uid(), type:"text", text:tpl.title, x:60, y:160, width:700, height:300,
      fontSize:72, fontFamily:"Inter", fontWeight:"900", fontStyle:"normal",
      textDecoration:"none", color:tpl.titleColor, align:"left",
      lineHeight:1.04, letterSpacing:-2, visible:true, locked:false, zIndex:2 },
    { id:uid(), type:"text", text:tpl.body, x:60, y:520, width:700, height:200,
      fontSize:24, fontFamily:"Inter", fontWeight:"400", fontStyle:"normal",
      textDecoration:"none", color:tpl.bodyColor, align:"left",
      lineHeight:1.45, letterSpacing:0, visible:true, locked:false, zIndex:3 },
  ];
  return {
    id: uid(),
    background: { type:"gradient", color:tpl.bgColor, gradient:{ from:tpl.gradFrom, to:tpl.gradTo, angle:135, type:"linear" } },
    layers,
  };
}

const DEMO_SLIDES: Slide[] = [
  makeSlideFromTemplate(TEMPLATES[0]),
  makeSlideFromTemplate(TEMPLATES[1]),
  makeSlideFromTemplate(TEMPLATES[2]),
  makeSlideFromTemplate(TEMPLATES[3]),
  makeSlideFromTemplate(TEMPLATES[4]),
];

const DEMO_PROJECTS: Project[] = [
  { id:uid(), title:"7 Segredos que fazem seu conteúdo parar o scroll", status:"Pronto", updated:"Hoje, 10:42", slides:DEMO_SLIDES.slice(0,5), tags:["viral","engajamento"] },
  { id:uid(), title:"Erros que diminuem seu alcance no Instagram", status:"Rascunho", updated:"Ontem, 18:10", slides:DEMO_SLIDES.slice(0,4), tags:["instagram"] },
  { id:uid(), title:"Bastidores de um projeto real de IA", status:"Agendado", updated:"05 set, 14:30", slides:DEMO_SLIDES.slice(0,3), tags:["ia","bastidores"] },
  { id:uid(), title:"Como Ganhar R$10k com Conteúdo Digital", status:"Publicado", updated:"03 set, 09:15", slides:DEMO_SLIDES.slice(0,7), tags:["monetização"] },
];

// ─── Background renderer helper ───────────────────────────────────────────────
function bgStyle(bg: SlideBackground): React.CSSProperties {
  if (bg.type === "gradient") {
    if (bg.gradient.type === "radial")
      return { background: `radial-gradient(circle, ${bg.gradient.from}, ${bg.gradient.to})` };
    return { background: `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})` };
  }
  if (bg.type === "image" && bg.imageSrc)
    return { backgroundImage:`url(${bg.imageSrc})`, backgroundSize:"cover", backgroundPosition:"center" };
  return { background: bg.color };
}

// ─── Slide Preview (mini card) ─────────────────────────────────────────────────
function SlidePreview({ slide, scale = 1 }: { slide: Slide; scale?: number }) {
  const PREVIEW_W = SLIDE_W * scale;
  const PREVIEW_H = SLIDE_H * scale;
  return (
    <div style={{ width: PREVIEW_W, height: PREVIEW_H, position:"relative", overflow:"hidden", borderRadius: scale < 0.2 ? 4 : 8, ...bgStyle(slide.background) }}>
      {[...slide.layers].sort((a,b)=>a.zIndex-b.zIndex).map(layer => {
        if (!layer.visible) return null;
        if (layer.type === "text") {
          const l = layer as TextLayer;
          return (
            <div key={l.id} style={{
              position:"absolute", left:l.x*scale, top:l.y*scale,
              width:l.width*scale, fontSize:l.fontSize*scale,
              fontFamily:l.fontFamily, fontWeight:l.fontWeight,
              fontStyle:l.fontStyle, textDecoration:l.textDecoration,
              color:l.color, textAlign:l.align, lineHeight:l.lineHeight,
              letterSpacing:l.letterSpacing*scale, whiteSpace:"pre-line",
              pointerEvents:"none", userSelect:"none",
            }}>{l.text}</div>
          );
        }
        if (layer.type === "shape") {
          const l = layer as ShapeLayer;
          return (
            <div key={l.id} style={{
              position:"absolute", left:l.x*scale, top:l.y*scale,
              width:l.width*scale, height:l.height*scale,
              background:l.fill, border:`${l.strokeWidth*scale}px solid ${l.stroke}`,
              borderRadius:l.shape==="circle"?"50%":`${l.borderRadius*scale}px`,
            }} />
          );
        }
        if (layer.type === "image") {
          const l = layer as ImageLayer;
          return (
            <img key={l.id} src={l.src} alt="" style={{
              position:"absolute", left:l.x*scale, top:l.y*scale,
              width:l.width*scale, height:l.height*scale,
              opacity:l.opacity, borderRadius:l.borderRadius*scale,
              objectFit:"cover", pointerEvents:"none",
              filter:`brightness(${l.filter.brightness}%) contrast(${l.filter.contrast}%) saturate(${l.filter.saturation}%) blur(${l.filter.blur}px)`,
            }} />
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (u: NonNullable<AuthUser>) => void }) {
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState(""), [pass, setPass] = useState(""), [name, setName] = useState("");
  const [loading, setLoading] = useState(false), [err, setErr] = useState("");

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, password:pass, name }),
      });
      const data = await res.json() as { user?: NonNullable<AuthUser>; error?: string };
      if (!res.ok || data.error) { setErr(data.error || "Erro desconhecido"); }
      else if (data.user) {
        localStorage.setItem("ps-user", JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch {
      setErr("Erro de conexão. Tente novamente.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><Sparkles/></div>
          <span>POST<strong>STUDIO</strong></span>
        </div>
        <h1>Crie carrosséis virais em<br/><em>menos de 1 minuto</em></h1>
        <p>Roteiro, copy e design profissional com IA. Sem Canva. Sem designer.</p>
        <div className="auth-features">
          {["Geração com IA em segundos","12+ templates profissionais","Export PNG 1080×1350px","Calendário de conteúdo"].map(f => (
            <div key={f}><Check/>{f}</div>
          ))}
        </div>
        <div className="auth-slides-preview">
          {DEMO_SLIDES.slice(0,3).map((s,i) => (
            <div key={s.id} className="auth-slide-mini" style={{transform:`rotate(${(i-1)*6}deg)`,zIndex:i}}>
              <SlidePreview slide={s} scale={0.07}/>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>Entrar</button>
            <button className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>Criar conta</button>
          </div>
          <h2>{mode==="login"?"Bem-vindo de volta":"Comece gratuitamente"}</h2>
          {mode==="signup" && (
            <label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome"/></label>
          )}
          <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/></label>
          <label>Senha<input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"/></label>
          {err && <div className="auth-err">{err}</div>}
          <button className="auth-submit" onClick={submit} disabled={loading}>
            {loading ? <><RefreshCw className="spin"/>Aguarde...</> : <>{mode==="login"?"Entrar na conta":"Criar conta grátis"}<ArrowRight/></>}
          </button>
          <div className="auth-divider"><span>ou</span></div>
          <button className="auth-demo" onClick={() => onLogin({ id:"demo", name:"Bruno Ribeiro", email:"bruno@demo.com", plan:"Creator", credits:186, avatar:"BR" })}>
            Entrar como Demo <ArrowRight/>
          </button>
          <p className="auth-terms">Ao continuar você concorda com os <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ go, projects, user }: { go: (p:string)=>void; projects: Project[]; user: NonNullable<AuthUser> }) {
  const days = ["SEG 01","TER 02","QUA 03","QUI 04","SEX 05","SÁB 06","DOM 07"];
  const today = 1;
  return (
    <div className="content">
      <div className="pg-title">
        <div>
          <small>TERÇA-FEIRA, 9 DE SETEMBRO DE 2026</small>
          <h1>Bom dia, {user.name.split(" ")[0]} 👋</h1>
        </div>
        <button className="btn-primary" onClick={()=>go("studio")}><Sparkles/>Criar com IA</button>
      </div>

      <div className="stats-grid">
        {[
          ["Carrosséis criados","24","+8 este mês","#ff6b27","var(--accent-o)"],
          ["Posts agendados","07","Próximo: hoje, 19h","#d62678","var(--accent-p)"],
          ["Créditos disponíveis",`${user.credits}`,"74% do plano","#22c55e","#dcfce7"],
          ["Economia estimada","32h","nos últimos 30 dias","#3b82f6","#dbeafe"],
        ].map(([label,val,sub,color,bg])=>(
          <article key={label} className="stat-card">
            <span>{label}</span>
            <strong style={{color}}>{val}</strong>
            <em style={{background:bg,color}}>{sub}</em>
          </article>
        ))}
      </div>

      <div className="dash-grid">
        <section className="panel">
          <div className="panel-head">
            <div><small>CONTINUE CRIANDO</small><h2>Projetos recentes</h2></div>
            <button onClick={()=>go("organizacao")}>Ver todos <ChevronRight/></button>
          </div>
          <div className="recent-list">
            {projects.slice(0,4).map((p,i) => (
              <button key={p.id} className="recent-item" onClick={()=>go("editor")}>
                <div className={`recent-thumb rt${i%4}`}>
                  <b>{p.slides.length}</b><small>slides</small>
                </div>
                <div className="recent-info">
                  <b>{p.title}</b>
                  <small>{p.updated}</small>
                </div>
                <span className={`status-badge s-${p.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s/g,"")}`}>{p.status}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="quick-cta">
          <small>COMECE AGORA</small>
          <h2>Da ideia ao post<br/>em poucos minutos.</h2>
          <p>Descreva um tema. A IA monta roteiro, copy e direção visual para você editar.</p>
          <button onClick={()=>go("studio")}><WandSparkles/>Gerar carrossel</button>
          <div className="quick-orb"/>
        </section>
      </div>

      <div className="dash-row2">
        <section className="panel trendings-mini">
          <div className="panel-head">
            <div><small>EM ALTA AGORA</small><h2>Trending Topics</h2></div>
            <button onClick={()=>go("trendings")}>Ver todos <ChevronRight/></button>
          </div>
          {TRENDINGS.slice(0,5).map(t => (
            <div key={t.id} className="trending-row">
              <div>
                {t.hot && <Flame className="hot-icon"/>}
                <span className="trend-cat">{t.category}</span>
                <p>{t.title}</p>
              </div>
              <button onClick={()=>go("studio")}><Play/></button>
            </div>
          ))}
        </section>

        <section className="panel week-panel">
          <div className="panel-head">
            <div><small>PLANEJAMENTO</small><h2>Sua semana</h2></div>
            <button onClick={()=>go("calendario")}>Calendário <ChevronRight/></button>
          </div>
          <div className="week-grid">
            {days.map((d,i) => (
              <div key={d} className={`week-day ${i===today?"today":""}`}>
                <small>{d.slice(0,3)}</small>
                <b>{d.slice(4)}</b>
                {[1,3,5].includes(i) && <div className="week-dot"/>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Studio (Create with AI) ──────────────────────────────────────────────────────

function buildImagePrompt(topic: string, niche: string, tone: string, tplName: string, slideIndex: number, slideTitle: string) {
  const styleMap: Record<string, string> = {
    "Viral Dark": "dark dramatic background, bold white typography, orange accent glow, high contrast",
    "Warm Minimal": "warm cream background, clean minimal design, terracotta accents, editorial style",
    "Neon Pop": "deep navy background, neon cyan glows, tech-futuristic aesthetic, electric colors",
    "Creator Bold": "vibrant orange-red gradient, bold yellow typography, energetic viral style",
    "Gradient Flow": "bold pink to orange gradient, premium vibrant colors, editorial magazine style",
    "Clean White": "white background, clean professional layout, pink accent colors, corporate modern",
    "Dark Purple": "deep purple luxury background, violet glows, premium dark aesthetic",
  };
  const style = styleMap[tplName] || "modern professional design, vibrant colors, clean typography";
  const toneMap: Record<string, string> = {
    "Direto e inspirador": "motivational, bold, direct",
    "Descontraído e divertido": "casual, fun, friendly",
    "Provocador e impactante": "provocative, edgy, impactful",
    "Educativo e profissional": "professional, educational, trustworthy",
    "Íntimo e próximo": "intimate, personal, conversational",
  };
  const toneStr = toneMap[tone] || tone;
  return `Instagram carousel slide ${slideIndex + 1} for "${slideTitle.slice(0, 40)}", niche: ${niche}, ${style}, ${toneStr} mood, no text overlay, photorealistic or digital art, ultra HD, 4:5 aspect ratio --ar 4:5 --q 2`;
}


function Studio({ onDone }: { onDone: (slides: Slide[], scripts: SlideScript[]) => void }) {
  const [prompt, setPrompt] = useState("5 maneiras de criar conteúdo que vende sem parecer propaganda");
  const [niche, setNiche] = useState("Marketing digital");
  const [tone, setTone] = useState("Direto e inspirador");
  const [count, setCount] = useState("5");
  const [goal, setGoal] = useState("Educar e gerar salvamentos");
  const [selectedTpl, setSelectedTpl] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<SlideScript[] | null>(null);
  const [generatedSlides, setGeneratedSlides] = useState<Slide[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const generate = () => {
    setLoading(true);
    setScripts(null);
    setTimeout(() => {
      const tpl = TEMPLATES[selectedTpl];
      const n = parseInt(count);
      const SCRIPTS: {kicker: string; title: string; body: string}[] = [
        { kicker: tpl.kicker, title: prompt.length > 55 ? prompt.slice(0, 55) + "..." : prompt,
          body: `Por que isso importa para quem atua em ${niche}? Descubra neste carrossel.` },
        ...Array.from({length: n - 1}, (_, i) => {
          const tips = ["Entenda o problema real","A virada de chave","O que os top 1% fazem","O erro mais comum","A ação que muda tudo","O segredo que ninguém conta","Como aplicar hoje","Resultados possíveis","Evite essa armadilha","Conclusão e próximos passos"];
          return {
            kicker: `${String(i + 2).padStart(2, "0")} — ${["DICA","PASSO","INSIGHT","ERRO","SEGREDO"][i % 5]}`,
            title: tips[i % tips.length],
            body: `Conteúdo específico sobre ${prompt.toLowerCase().slice(0, 40)} aplicado ao nicho de ${niche}.`,
          };
        })
      ];

      const newScripts: SlideScript[] = SCRIPTS.map((sc, i) => ({
        index: i,
        kicker: sc.kicker,
        title: sc.title,
        body: sc.body,
        imagePrompt: buildImagePrompt(prompt, niche, tone, tpl.name, i, sc.title),
      }));

      const newSlides: Slide[] = newScripts.map((sc) => {
        const s = makeSlideFromTemplate(tpl);
        (s.layers[0] as TextLayer).text = sc.kicker;
        (s.layers[1] as TextLayer).text = sc.title;
        (s.layers[2] as TextLayer).text = sc.body;
        s.imagePrompt = sc.imagePrompt;
        return s;
      });

      setGeneratedSlides(newSlides);
      setScripts(newScripts);
      setLoading(false);
    }, 1800);
  };

  // ── RESULT VIEW ──
  if (scripts) {
    return (
      <div className="content">
        <div className="script-header">
          <div>
            <div className="script-badge"><Check/>Roteiro gerado com sucesso!</div>
            <h1 style={{fontSize:28,fontWeight:900,letterSpacing:-0.5,marginTop:2}}>{scripts.length} slides prontos para editar</h1>
            <p style={{fontSize:13,color:"var(--muted)",marginTop:6}}>Copie os prompts abaixo, gere as imagens na IA de sua escolha (Midjourney, DALL·E, ChatGPT), depois faça upload no editor.</p>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button className="btn-secondary" onClick={()=>setScripts(null)}><RefreshCw/>Novo roteiro</button>
            <button className="btn-primary" onClick={()=>onDone(generatedSlides, scripts)}><WandSparkles/>Ir para o editor</button>
          </div>
        </div>

        <div className="script-grid">
          {scripts.map((sc, i) => (
            <div key={i} className="script-card">
              <div className="script-card-top">
                <div className="script-num">{sc.index + 1}</div>
                <div className="script-texts">
                  <div className="script-kicker">{sc.kicker}</div>
                  <div className="script-title">{sc.title}</div>
                  <div className="script-body">{sc.body}</div>
                </div>
              </div>
              <div className="script-prompt-box">
                <div className="script-prompt-label">
                  <Sparkles/>PROMPT PARA IMAGEM IA
                </div>
                <div className="prompt-text">{sc.imagePrompt}</div>
                <div className="prompt-actions">
                  <button
                    className={`prompt-copy-btn ${copiedIdx === i ? "copied" : ""}`}
                    onClick={() => copyPrompt(sc.imagePrompt, i)}
                  >
                    {copiedIdx === i ? <Check/> : <Copy/>}
                    {copiedIdx === i ? "Copiado!" : "Copiar prompt"}
                  </button>
                  <a className="ai-link-btn" href="https://chat.openai.com" target="_blank" rel="noreferrer"><ExternalLink/>ChatGPT</a>
                  <a className="ai-link-btn" href="https://www.midjourney.com" target="_blank" rel="noreferrer"><ExternalLink/>Midjourney</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="script-footer">
          <div>
            <strong>Próximo passo</strong>
            <p>Gere as imagens usando os prompts acima, faça upload de cada uma no editor e personalize os textos do seu carrossel.</p>
          </div>
          <div className="script-footer-btns">
            <button className="btn-secondary" onClick={() => setScripts(null)}><RotateCcw/>Refazer roteiro</button>
            <button className="btn-primary" onClick={() => onDone(generatedSlides, scripts)}><WandSparkles/>Abrir no editor<ArrowRight/></button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM VIEW ──
  return (
    <div className="content narrow">
      <div className="pg-title"><div><small>ESTÚDIO DE CRIAÇÃO</small><h1>O que vamos criar hoje?</h1></div></div>
      <div className="studio-grid">
        <section className="generator">
          <div className="gen-badge"><WandSparkles/>Roteiro + prompts de imagem com IA</div>
          <label className="field-label">Qual é o tema do carrossel?
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={300} placeholder="Descreva o tema, produto ou ideia principal..."/>
            <small className="char-count">{prompt.length}/300</small>
          </label>
          <div className="fields-2">
            <label className="field-label">Nicho<select value={niche} onChange={e=>setNiche(e.target.value)}>
              {["Marketing digital","Design e criatividade","Negócios","Saúde e bem-estar","Tecnologia e IA","Finanças","Educação","Lifestyle","Empreendedorismo"].map(n=><option key={n}>{n}</option>)}
            </select></label>
            <label className="field-label">Tom de voz<select value={tone} onChange={e=>setTone(e.target.value)}>
              {["Direto e inspirador","Descontraído e divertido","Provocador e impactante","Educativo e profissional","Íntimo e próximo"].map(t=><option key={t}>{t}</option>)}
            </select></label>
            <label className="field-label">Número de slides<select value={count} onChange={e=>setCount(e.target.value)}>
              {["3","5","7","10","12","15"].map(n=><option key={n}>{n} slides</option>)}
            </select></label>
            <label className="field-label">Objetivo<select value={goal} onChange={e=>setGoal(e.target.value)}>
              {["Educar e gerar salvamentos","Vender produto/serviço","Gerar comentários","Aumentar seguidores","Gerar leads"].map(g=><option key={g}>{g}</option>)}
            </select></label>
          </div>
          <div className="quick-ideas">
            <span>Sugestões rápidas</span>
            {["Erros comuns do meu nicho","Passo a passo prático","Mitos e verdades","Bastidores do meu trabalho"].map(x=>(
              <button key={x} onClick={()=>setPrompt(x)}>{x}</button>
            ))}
          </div>
          <button className="btn-generate" disabled={loading} onClick={generate}>
            {loading ? <><RefreshCw className="spin"/>Gerando roteiro e prompts...</> : <><Sparkles/>Gerar roteiro com IA <span>{count} slides</span></>}
          </button>
        </section>

        <section className="tpl-picker">
          <small>ESCOLHA O VISUAL</small>
          <h3>Template de Design</h3>
          <div className="tpl-pick-grid">
            {TEMPLATES.slice(0,8).map((t,i) => (
              <button key={t.id} className={`tpl-pick-item ${selectedTpl===i?"selected":""}`} onClick={()=>setSelectedTpl(i)}>
                <div className="tpl-pick-thumb" style={{background:t.thumb}}/>
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Templates Gallery ────────────────────────────────────────────────────────
function Templates({ onUse }: { onUse: (tpl:typeof TEMPLATES[0])=>void }) {
  const [cat, setCat] = useState("Todos");
  const cats = ["Todos", ...Array.from(new Set(TEMPLATES.map(t=>t.category)))];
  const filtered = cat==="Todos" ? TEMPLATES : TEMPLATES.filter(t=>t.category===cat);

  return (
    <div className="content">
      <div className="pg-title">
        <div><small>DIREÇÃO VISUAL</small><h1>Templates</h1></div>
        <button className="btn-secondary"><Plus/>Criar template</button>
      </div>
      <div className="cat-tabs">
        {cats.map(c=><button key={c} className={cat===c?"active":""} onClick={()=>setCat(c)}>{c}</button>)}
      </div>
      <div className="tpl-grid">
        {filtered.map((t) => (
          <article key={t.id} className="tpl-card">
            <div className="tpl-thumb" style={{background:t.thumb}}>
              <div className="tpl-overlay">
                <button className="btn-primary" onClick={()=>onUse(t)}>Usar template</button>
              </div>
              <div className="tpl-preview-layers">
                <small style={{color:t.kickerColor,fontSize:7,fontWeight:"800",letterSpacing:2}}>{t.kicker}</small>
                <b style={{color:t.titleColor,fontSize:14,lineHeight:1.05,fontWeight:"900"}}>{t.title.replace(/\n/g," ")}</b>
              </div>
            </div>
            <div className="tpl-info">
              <div>
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
              </div>
              <span className="tpl-cat-badge">{t.category}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── Trendings ────────────────────────────────────────────────────────────────
function Trendings({ onGenerate }: { onGenerate: (title:string)=>void }) {
  const [cat, setCat] = useState("Todos");
  const cats = ["Todos","IA","Marketing","Tech","Growth","Negócios","Instagram"];
  const filtered = cat==="Todos" ? TRENDINGS : TRENDINGS.filter(t=>t.category===cat);

  return (
    <div className="content">
      <div className="pg-title">
        <div><small>CONTEÚDO EM ALTA</small><h1>Trendings</h1></div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-secondary"><RefreshCw/>Atualizar</button>
          <button className="btn-primary"><Bell/>Alertas</button>
        </div>
      </div>
      <div className="cat-tabs">
        {cats.map(c=><button key={c} className={cat===c?"active":""} onClick={()=>setCat(c)}>{c}</button>)}
      </div>
      <div className="trendings-grid">
        {filtered.map((t,i) => (
          <article key={t.id} className="trending-card">
            <div className="trending-rank">#{i+1}</div>
            <div className="trending-content">
              <div className="trending-meta">
                <span className={`trend-badge ${t.hot?"hot":""}`}>{t.hot && <Flame/>}{t.category}</span>
                <span className="trend-time">{t.time} atrás</span>
                <span className="trend-views"><Eye/>{t.views} views</span>
              </div>
              <h3>{t.title}</h3>
              <div className="trending-actions">
                <button className="btn-primary sm" onClick={()=>onGenerate(t.title)}>
                  <WandSparkles/>Gerar carrossel
                </button>
                <button className="btn-secondary sm"><Plus/>Salvar ideia</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── Organizacao (Library) ────────────────────────────────────────────────────
function Organizacao({ projects, onOpen, onDelete }: {
  projects: Project[]; onOpen:(p:Project)=>void; onDelete:(id:string)=>void;
}) {
  const [filter, setFilter] = useState("Todos");
  const [view, setView] = useState<"grid"|"list">("grid");
  const [search, setSearch] = useState("");
  const statuses = ["Todos","Rascunho","Pronto","Agendado","Publicado"];
  const filtered = projects.filter(p =>
    (filter==="Todos" || p.status===filter) &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="content">
      <div className="pg-title">
        <div><small>BIBLIOTECA</small><h1>Meus carrosséis</h1></div>
        <button className="btn-primary"><Plus/>Novo projeto</button>
      </div>
      <div className="lib-toolbar">
        <div className="cat-tabs">
          {statuses.map(s=><button key={s} className={filter===s?"active":""} onClick={()=>setFilter(s)}>{s}</button>)}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div className="search-mini"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..."/></div>
          <button className={`view-btn ${view==="grid"?"active":""}`} onClick={()=>setView("grid")}><Grid/></button>
          <button className={`view-btn ${view==="list"?"active":""}`} onClick={()=>setView("list")}><List/></button>
        </div>
      </div>
      {view==="grid" ? (
        <div className="projects-grid">
          {filtered.map((p,i) => (
            <article key={p.id} className="project-card">
              <button className={`project-cover pc${i%4}`} onClick={()=>onOpen(p)}>
                <small>{p.slides[0]?.layers.find(l=>l.type==="text")? (p.slides[0].layers[0] as TextLayer).text : "CARROSSEL"}</small>
                <b>{p.title}</b>
                <span>{p.slides.length} slides</span>
              </button>
              <div className="project-footer">
                <div>
                  <b>{p.title}</b>
                  <small>{p.updated} · <span className={`status-badge s-${p.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s/g,"")}`}>{p.status}</span></small>
                </div>
                <div style={{display:"flex",gap:4}}>
                  <button className="icon-btn" title="Abrir" onClick={()=>onOpen(p)}><ExternalLink/></button>
                  <button className="icon-btn danger" title="Excluir" onClick={()=>onDelete(p.id)}><Trash2/></button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length===0 && <div className="empty-state"><FolderOpen/><p>Nenhum projeto encontrado</p></div>}
        </div>
      ) : (
        <div className="projects-list">
          {filtered.map((p,i) => (
            <div key={p.id} className="project-row">
              <div className={`project-row-thumb pr${i%4}`}><b>{p.slides.length}</b></div>
              <div className="project-row-info">
                <b>{p.title}</b>
                <small>{p.updated}</small>
              </div>
              <span className={`status-badge s-${p.status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s/g,"")}`}>{p.status}</span>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-secondary sm" onClick={()=>onOpen(p)}>Abrir</button>
                <button className="icon-btn danger" onClick={()=>onDelete(p.id)}><Trash2/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function CalendarPage() {
  const [month, setMonth] = useState(8); // September (0-indexed)
  const [year] = useState(2026);
  const monthName = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][month];
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const scheduledDays = [3,8,12,15,19,22,26,28];
  const cells = Array.from({length: Math.ceil((firstDay+daysInMonth)/7)*7}, (_,i) => {
    const d = i - firstDay + 1;
    return (d >= 1 && d <= daysInMonth) ? d : null;
  });

  return (
    <div className="content">
      <div className="pg-title">
        <div><small>PLANEJAMENTO</small><h1>Calendário de conteúdo</h1></div>
        <button className="btn-primary"><Sparkles/>Planejar mês com IA</button>
      </div>
      <section className="cal-section">
        <div className="cal-nav">
          <button onClick={()=>setMonth(m=>Math.max(0,m-1))}><ChevronLeft/></button>
          <h2>{monthName} {year}</h2>
          <button onClick={()=>setMonth(m=>Math.min(11,m+1))}><ChevronRight/></button>
          <span>{scheduledDays.length} agendados</span>
        </div>
        <div className="cal-grid">
          {["DOM","SEG","TER","QUA","QUI","SEX","SÁB"].map(d=><div key={d} className="cal-header">{d}</div>)}
          {cells.map((d,i) => (
            <div key={i} className={`cal-cell ${d===9?"today":""} ${!d?"empty":""}`}>
              {d && <span>{d}</span>}
              {d && scheduledDays.includes(d) && (
                <div className="cal-event">
                  <Play/>Carrossel
                  <small>19:00</small>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Members ──────────────────────────────────────────────────────────────────
function MembersPage() {
  const members: Member[] = [
    {id:"1",name:"Bruno Ribeiro",email:"bruno@poststudio.com",role:"Admin",avatar:"BR"},
    {id:"2",name:"Ana Ferreira",email:"ana@cliente.com",role:"Editor",avatar:"AF"},
    {id:"3",name:"Carlos Mendes",email:"carlos@agencia.com",role:"Editor",avatar:"CM"},
    {id:"4",name:"Diana Lima",email:"diana@marca.com",role:"Viewer",avatar:"DL"},
  ];
  return (
    <div className="content">
      <div className="pg-title">
        <div><small>EQUIPE</small><h1>Members</h1></div>
        <button className="btn-primary"><Plus/>Convidar membro</button>
      </div>
      <section className="panel">
        <table className="members-table">
          <thead><tr><th>Membro</th><th>Email</th><th>Função</th><th>Ações</th></tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>
                  <div className="member-cell">
                    <div className="member-avatar">{m.avatar}</div>
                    <span>{m.name}</span>
                  </div>
                </td>
                <td><span className="text-muted">{m.email}</span></td>
                <td><span className={`role-badge role-${m.role.toLowerCase()}`}>{m.role}</span></td>
                <td>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn-secondary sm">Editar</button>
                    <button className="icon-btn danger"><Trash2/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ─── Configuracoes ────────────────────────────────────────────────────────────
function Configuracoes({ user }: { user: NonNullable<AuthUser> }) {
  return (
    <div className="content">
      <div className="pg-title"><div><small>CONTA</small><h1>Configurações</h1></div></div>
      <div className="settings-grid">
        <section className="panel">
          <h3>Perfil</h3>
          <div className="settings-avatar"><div className="member-avatar big">{user.avatar}</div></div>
          <label className="field-label">Nome completo<input defaultValue={user.name}/></label>
          <label className="field-label">Email<input defaultValue={user.email}/></label>
          <button className="btn-primary" style={{marginTop:16}}>Salvar alterações</button>
        </section>
        <section className="panel">
          <h3>Plano atual</h3>
          <div className="plan-card-highlight">
            <div><Zap/><span>Plano {user.plan}</span></div>
            <div className="credits-bar">
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <small>Créditos utilizados</small>
                <b>{250-user.credits} / 250</b>
              </div>
              <div className="bar-track"><div className="bar-fill" style={{width:`${((250-user.credits)/250)*100}%`}}/></div>
            </div>
            <button className="btn-primary"><CreditCard/>Fazer upgrade</button>
          </div>
          <div className="plan-features">
            {["Carrosséis ilimitados","Geração com IA","Templates profissionais","Export PNG 1080×1350","Calendário de conteúdo"].map(f=>(
              <div key={f}><Check/>{f}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Editor (Photoshop-like) ──────────────────────────────────────────────────
type EditorPanel = "texto"|"estilo"|"imagem"|"elementos"|"camadas";

function Editor({ slides, setSlides, selSlide, setSelSlide, onSave, onToast, onBack }: {
  slides: Slide[]; setSlides:(s:Slide[])=>void;
  selSlide:number; setSelSlide:(n:number)=>void;
  onSave:()=>void; onToast:(m:string)=>void;
  onBack: ()=>void;
}) {
  const [selLayer, setSelLayer] = useState<string|null>(null);
  const [panel, setPanel] = useState<EditorPanel>("texto");
  const [zoom, setZoom] = useState(0.45);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const slide = slides[selSlide];
  const layer = slide?.layers.find(l=>l.id===selLayer) || null;

  const updateSlide = useCallback((updater:(s:Slide)=>Slide) => {
    setSlides(slides.map((s,i)=>i===selSlide?updater(s):s));
  },[slides,selSlide,setSlides]);

  const updateLayer = useCallback(<T extends Layer>(id:string, patch:Partial<T>) => {
    updateSlide(s=>({...s, layers:s.layers.map(l=>l.id===id?{...l,...patch}:l) as Layer[]}));
  },[updateSlide]);

  const updateBg = useCallback((patch:Partial<SlideBackground>) => {
    updateSlide(s=>({...s, background:{...s.background,...patch}}));
  },[updateSlide]);

  const addTextLayer = () => {
    const l: TextLayer = {
      id:uid(), type:"text", text:"Novo texto", x:60, y:400, width:400, height:100,
      fontSize:36, fontFamily:"Inter", fontWeight:"700", fontStyle:"normal",
      textDecoration:"none", color:"#ffffff", align:"left",
      lineHeight:1.2, letterSpacing:0, visible:true, locked:false, zIndex:slide.layers.length+1,
    };
    updateSlide(s=>({...s,layers:[...s.layers,l]}));
    setSelLayer(l.id);
    setPanel("texto");
  };

  const addShape = (shape: "rect"|"circle") => {
    const l: ShapeLayer = {
      id:uid(), type:"shape", shape, x:100, y:500, width:200, height:shape==="circle"?200:80,
      fill:"rgba(255,255,255,0.15)", stroke:"rgba(255,255,255,0.3)", strokeWidth:2,
      borderRadius:12, visible:true, locked:false, zIndex:slide.layers.length+1,
    };
    updateSlide(s=>({...s,layers:[...s.layers,l]}));
    setSelLayer(l.id);
    setPanel("estilo");
  };

  const deleteLayer = (id: string) => {
    updateSlide(s=>({...s,layers:s.layers.filter(l=>l.id!==id)}));
    setSelLayer(null);
  };

  const addSlide = () => {
    const newSlide: Slide = { ...JSON.parse(JSON.stringify(slide)), id:uid() };
    setSlides([...slides.slice(0,selSlide+1),newSlide,...slides.slice(selSlide+1)]);
    setSelSlide(selSlide+1);
  };

  const removeSlide = (i:number) => {
    if (slides.length<=1) return;
    const ns = slides.filter((_,idx)=>idx!==i);
    setSlides(ns);
    setSelSlide(Math.min(i,ns.length-1));
  };

  const exportPNG = async () => {
    onToast("Gerando PNG...");
    const { default: html2canvas } = await import("html2canvas");
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, {
      scale:2, useCORS:true,
      width:canvasRef.current.offsetWidth,
      height:canvasRef.current.offsetHeight,
    });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `poststudio-slide-${selSlide+1}.png`;
    a.click();
    onToast("PNG exportado com sucesso!");
  };

  const exportSVG = () => {
    const s = slide;
    const esc = (v:string) => v.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
    let bgAttr = "";
    if (s.background.type==="gradient") bgAttr = `fill="url(#bg-grad)"`;
    else bgAttr = `fill="${s.background.color}"`;

    const textLayers = s.layers.filter(l=>l.type==="text"&&l.visible) as TextLayer[];
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SLIDE_W}" height="${SLIDE_H}">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${s.background.gradient.from}"/>
      <stop offset="100%" stop-color="${s.background.gradient.to}"/>
    </linearGradient>
  </defs>
  <rect width="${SLIDE_W}" height="${SLIDE_H}" ${bgAttr}/>
  ${textLayers.map(l=>`<foreignObject x="${l.x}" y="${l.y}" width="${l.width}" height="400">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:${l.fontFamily},Arial,sans-serif;font-size:${l.fontSize}px;font-weight:${l.fontWeight};color:${l.color};line-height:${l.lineHeight};letter-spacing:${l.letterSpacing}px;text-align:${l.align};white-space:pre-line">${esc(l.text)}</div>
  </foreignObject>`).join("\n")}
</svg>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svgContent],{type:"image/svg+xml"}));
    a.download = `poststudio-slide-${selSlide+1}.svg`;
    a.click();
    onToast("SVG exportado com sucesso!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const l: ImageLayer = {
        id:uid(), type:"image", src, x:0, y:0, width:SLIDE_W, height:SLIDE_H,
        opacity:1, borderRadius:0, visible:true, locked:false,
        zIndex:0, filter:{brightness:100,contrast:100,saturation:100,blur:0},
      };
      updateSlide(s=>({...s,layers:[l,...s.layers.map(x=>({...x,zIndex:x.zIndex+1}))]}));
      setSelLayer(l.id);
      setPanel("imagem");
    };
    reader.readAsDataURL(file);
  };

  if (!slide) return null;

  const SCALE = zoom;
  const CANVAS_W = SLIDE_W * SCALE;
  const CANVAS_H = SLIDE_H * SCALE;

  return (
    <div className="editor-shell">
      {/* Top bar */}
      <div className="editor-topbar">
        <div className="editor-topbar-left">
          <button className="btn-ghost" onClick={onBack}><ChevronLeft/>Voltar</button>
          <span className="editor-title">Editor Visual</span>
        </div>
        <div className="editor-topbar-tools">
          <button className="tool-btn" title="Zoom out" onClick={()=>setZoom(z=>Math.max(0.2,z-0.05))}><ZoomOut/></button>
          <span className="zoom-label">{Math.round(zoom*100)}%</span>
          <button className="tool-btn" title="Zoom in" onClick={()=>setZoom(z=>Math.min(1.2,z+0.05))}><ZoomIn/></button>
        </div>
        <div className="editor-topbar-right">
          <button className="btn-ghost" onClick={onSave}><Save/>Salvar</button>
          <button className="btn-secondary sm" onClick={exportSVG}><Download/>SVG</button>
          <button className="btn-primary" onClick={exportPNG}><Download/>Exportar PNG</button>
        </div>
      </div>

      <div className="editor-body">
        {/* Slide Rail */}
        <aside className="slide-rail">
          <div className="rail-header">
            <small>SLIDES</small>
            <button title="Adicionar slide" onClick={addSlide}><Plus/></button>
          </div>
          <div className="rail-list">
            {slides.map((s,i) => (
              <div key={s.id} className={`rail-item ${i===selSlide?"active":""}`} onClick={()=>{setSelSlide(i);setSelLayer(null);}}>
                <span className="rail-num">{i+1}</span>
                <div className="rail-thumb">
                  <SlidePreview slide={s} scale={0.1}/>
                </div>
                {slides.length>1 && (
                  <button className="rail-delete" onClick={e=>{e.stopPropagation();removeSlide(i);}}><X/></button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas area */}
        <section className="canvas-area">
          <div className="canvas-container" onClick={()=>setSelLayer(null)}>
            <div ref={canvasRef} style={{ width:CANVAS_W, height:CANVAS_H, position:"relative", overflow:"hidden", borderRadius:8, boxShadow:"0 32px 80px rgba(0,0,0,0.25)", ...bgStyle(slide.background) }} onClick={e=>e.stopPropagation()}>
              {[...slide.layers].sort((a,b)=>a.zIndex-b.zIndex).map(lyr => {
                if (!lyr.visible) return null;
                const isSelected = lyr.id===selLayer;
                if (lyr.type==="text") {
                  const l = lyr as TextLayer;
                  return (
                    <div key={l.id}
                      style={{position:"absolute",left:l.x*SCALE,top:l.y*SCALE,width:l.width*SCALE,
                        fontSize:l.fontSize*SCALE,fontFamily:l.fontFamily,fontWeight:l.fontWeight,
                        fontStyle:l.fontStyle,textDecoration:l.textDecoration,color:l.color,
                        textAlign:l.align,lineHeight:l.lineHeight,letterSpacing:l.letterSpacing*SCALE,
                        whiteSpace:"pre-line",cursor:"pointer",userSelect:"none",
                        outline:isSelected?"2px solid #ff5a32":"none",
                        outlineOffset:4,borderRadius:4,padding:"2px 4px",
                      }}
                      onClick={e=>{e.stopPropagation();setSelLayer(l.id);setPanel("texto");}}
                    >{l.text}</div>
                  );
                }
                if (lyr.type==="shape") {
                  const l = lyr as ShapeLayer;
                  return (
                    <div key={l.id}
                      style={{position:"absolute",left:l.x*SCALE,top:l.y*SCALE,
                        width:l.width*SCALE,height:l.height*SCALE,
                        background:l.fill,border:`${l.strokeWidth*SCALE}px solid ${l.stroke}`,
                        borderRadius:l.shape==="circle"?"50%":`${l.borderRadius*SCALE}px`,
                        cursor:"pointer",outline:isSelected?"2px solid #ff5a32":"none",
                      }}
                      onClick={e=>{e.stopPropagation();setSelLayer(l.id);setPanel("estilo");}}
                    />
                  );
                }
                if (lyr.type==="image") {
                  const l = lyr as ImageLayer;
                  return (
                    <img key={l.id} src={l.src} alt="" onClick={e=>{e.stopPropagation();setSelLayer(l.id);setPanel("imagem");}}
                      style={{position:"absolute",left:l.x*SCALE,top:l.y*SCALE,
                        width:l.width*SCALE,height:l.height*SCALE,
                        opacity:l.opacity,borderRadius:l.borderRadius*SCALE,objectFit:"cover",cursor:"pointer",
                        filter:`brightness(${l.filter.brightness}%) contrast(${l.filter.contrast}%) saturate(${l.filter.saturation}%) blur(${l.filter.blur}px)`,
                        outline:isSelected?"2px solid #ff5a32":"none",
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="canvas-nav">
            <button disabled={!selSlide} onClick={()=>setSelSlide(selSlide-1)}><ChevronLeft/></button>
            <span>{selSlide+1} / {slides.length}</span>
            <button disabled={selSlide===slides.length-1} onClick={()=>setSelSlide(selSlide+1)}><ChevronRight/></button>
          </div>
        </section>

        {/* Properties Panel */}
        <aside className="props-panel">
          <h3>Personalizar</h3>
          <div className="props-tabs">
            {([["texto","Texto",Type],["estilo","Estilo",Palette],["imagem","Imagem",ImageIcon],["elementos","Elem.",Layers],["camadas","Camadas",SlidersHorizontal]] as [EditorPanel,string,typeof Type][]).map(([id,label,Icon])=>(
              <button key={id} className={panel===id?"active":""} onClick={()=>setPanel(id)} title={label}>
                <Icon/><span>{label}</span>
              </button>
            ))}
          </div>

          {/* TEXT PANEL */}
          {panel==="texto" && (
            <div className="props-body">
              <button className="add-layer-btn" onClick={addTextLayer}><Plus/>Adicionar texto</button>
              {layer?.type==="text" && (() => {
                const l = layer as TextLayer;
                return (
                  <>
                    <label className="field-label">Conteúdo
                      <textarea value={l.text} onChange={e=>updateLayer(l.id,{text:e.target.value})}/>
                    </label>
                    <label className="field-label">Fonte
                      <select value={l.fontFamily} onChange={e=>updateLayer(l.id,{fontFamily:e.target.value})}>
                        {FONTS.map(f=><option key={f}>{f}</option>)}
                      </select>
                    </label>
                    <div className="field-row">
                      <label className="field-label half">Tamanho
                        <input type="number" value={l.fontSize} min={8} max={300} onChange={e=>updateLayer(l.id,{fontSize:+e.target.value})}/>
                      </label>
                      <label className="field-label half">Peso
                        <select value={l.fontWeight} onChange={e=>updateLayer(l.id,{fontWeight:e.target.value as TextLayer["fontWeight"]})}>
                          {["400","600","700","800","900"].map(w=><option key={w}>{w}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="text-format-btns">
                      <button className={l.fontStyle==="italic"?"active":""} onClick={()=>updateLayer(l.id,{fontStyle:l.fontStyle==="italic"?"normal":"italic"})} title="Itálico"><Italic/></button>
                      <button className={l.textDecoration==="underline"?"active":""} onClick={()=>updateLayer(l.id,{textDecoration:l.textDecoration==="underline"?"none":"underline"})} title="Sublinhado"><Underline/></button>
                      <button className={l.align==="left"?"active":""} onClick={()=>updateLayer(l.id,{align:"left"})} title="Esq"><AlignLeft/></button>
                      <button className={l.align==="center"?"active":""} onClick={()=>updateLayer(l.id,{align:"center"})} title="Centro"><AlignCenter/></button>
                      <button className={l.align==="right"?"active":""} onClick={()=>updateLayer(l.id,{align:"right"})} title="Dir"><AlignRight/></button>
                    </div>
                    <label className="field-label">Cor do texto
                      <div className="color-row"><input type="color" value={l.color.startsWith("rgba")?l.color:"#ffffff"} onChange={e=>updateLayer(l.id,{color:e.target.value})}/><span>{l.color}</span></div>
                    </label>
                    <div className="field-row">
                      <label className="field-label half">Altura da linha
                        <input type="number" value={l.lineHeight} step={0.05} min={0.8} max={3} onChange={e=>updateLayer(l.id,{lineHeight:+e.target.value})}/>
                      </label>
                      <label className="field-label half">Espaç. letras
                        <input type="number" value={l.letterSpacing} min={-5} max={20} onChange={e=>updateLayer(l.id,{letterSpacing:+e.target.value})}/>
                      </label>
                    </div>
                    <label className="field-label">Posição X
                      <input type="range" min={0} max={SLIDE_W-l.width} value={l.x} onChange={e=>updateLayer(l.id,{x:+e.target.value})}/>
                    </label>
                    <label className="field-label">Posição Y
                      <input type="range" min={0} max={SLIDE_H-50} value={l.y} onChange={e=>updateLayer(l.id,{y:+e.target.value})}/>
                    </label>
                    <label className="field-label">Largura
                      <input type="range" min={100} max={SLIDE_W-l.x} value={l.width} onChange={e=>updateLayer(l.id,{width:+e.target.value})}/>
                    </label>
                    <button className="danger-btn" onClick={()=>deleteLayer(l.id)}><Trash2/>Remover camada</button>
                  </>
                );
              })()}
              {!layer && <p className="hint-text">Clique em um texto no canvas para editar, ou adicione um novo.</p>}
            </div>
          )}

          {/* STYLE PANEL */}
          {panel==="estilo" && (
            <div className="props-body">
              <label className="field-label">Tipo de fundo
                <select value={slide.background.type} onChange={e=>updateBg({type:e.target.value as SlideBackground["type"]})}>
                  <option value="solid">Cor sólida</option>
                  <option value="gradient">Gradiente</option>
                </select>
              </label>
              {slide.background.type==="solid" && (
                <label className="field-label">Cor do fundo
                  <div className="color-row"><input type="color" value={slide.background.color} onChange={e=>updateBg({color:e.target.value})}/><span>{slide.background.color}</span></div>
                </label>
              )}
              {slide.background.type==="gradient" && (
                <>
                  <label className="field-label">Tipo de gradiente
                    <select value={slide.background.gradient.type} onChange={e=>updateBg({gradient:{...slide.background.gradient,type:e.target.value as "linear"|"radial"}})}>
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                  </label>
                  <div className="field-row">
                    <label className="field-label half">Cor inicial
                      <input type="color" value={slide.background.gradient.from} onChange={e=>updateBg({gradient:{...slide.background.gradient,from:e.target.value}})}/>
                    </label>
                    <label className="field-label half">Cor final
                      <input type="color" value={slide.background.gradient.to} onChange={e=>updateBg({gradient:{...slide.background.gradient,to:e.target.value}})}/>
                    </label>
                  </div>
                  {slide.background.gradient.type==="linear" && (
                    <label className="field-label">Ângulo ({slide.background.gradient.angle}°)
                      <input type="range" min={0} max={360} value={slide.background.gradient.angle} onChange={e=>updateBg({gradient:{...slide.background.gradient,angle:+e.target.value}})}/>
                    </label>
                  )}
                </>
              )}
              <div className="gradient-presets">
                <small>Presets rápidos</small>
                <div className="preset-grid">
                  {[
                    ["#c62283","#ff6a2b"],["#040d21","#0d1b3e"],["#ff4500","#ff8c00"],
                    ["#1a0a2e","#2d1b69"],["#833ab4","#fcb045"],["#1e3a5f","#2e86ab"],
                    ["#1a1a1a","#2c2c2c"],["#0f0c1a","#1a0a2e"],
                  ].map(([f,t])=>(
                    <button key={f+t} className="preset-swatch"
                      style={{background:`linear-gradient(135deg,${f},${t})`}}
                      onClick={()=>updateBg({type:"gradient",gradient:{from:f,to:t,angle:135,type:"linear"}})}
                    />
                  ))}
                </div>
              </div>
              {layer?.type==="shape" && (() => {
                const l = layer as ShapeLayer;
                return (
                  <div style={{marginTop:16,borderTop:"1px solid var(--border)",paddingTop:16}}>
                    <label className="field-label">Cor de preenchimento
                      <input type="color" value={l.fill.startsWith("rgba")?l.fill:"#ffffff"} onChange={e=>updateLayer(l.id,{fill:e.target.value})}/>
                    </label>
                    <label className="field-label">Borda arredondada
                      <input type="range" min={0} max={100} value={l.borderRadius} onChange={e=>updateLayer(l.id,{borderRadius:+e.target.value})}/>
                    </label>
                    <button className="danger-btn" onClick={()=>deleteLayer(l.id)}><Trash2/>Remover</button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* IMAGE PANEL */}
          {panel==="imagem" && (
            <div className="props-body">
              <input type="file" accept="image/*" ref={fileRef} style={{display:"none"}} onChange={handleImageUpload}/>
              <button className="add-layer-btn" onClick={()=>fileRef.current?.click()}><Upload/>Fazer upload de imagem</button>
              {slide.imagePrompt && (
                <div className="img-prompt-box">
                  <small><Sparkles/>PROMPT IA PARA ESTE SLIDE</small>
                  <div className="img-prompt-text">{slide.imagePrompt}</div>
                  <div className="img-prompt-actions">
                    <button className="prompt-copy-btn" onClick={()=>navigator.clipboard.writeText(slide.imagePrompt!)}><Copy/>Copiar</button>
                    <a className="ai-link-btn" href="https://chat.openai.com" target="_blank" rel="noreferrer"><ExternalLink/>ChatGPT</a>
                  </div>
                </div>
              )}
              {!slide.imagePrompt && (
                <div style={{fontSize:11,color:"var(--muted)",background:"#f8f7ff",borderRadius:8,padding:"10px 12px",marginBottom:12,border:"1px solid #e9d5ff"}}>
                  <Sparkles style={{width:12,display:"inline",marginRight:4,color:"#7c3aed"}}/>
                  <strong style={{color:"#7c3aed"}}>Dica:</strong> Gere o roteiro no Studio para obter prompts de IA para cada slide.
                </div>
              )}
              {layer?.type==="image" && (() => {
                const l = layer as ImageLayer;
                return (
                  <>
                    <label className="field-label">Opacidade ({Math.round(l.opacity*100)}%)
                      <input type="range" min={0} max={1} step={0.01} value={l.opacity} onChange={e=>updateLayer(l.id,{opacity:+e.target.value})}/>
                    </label>
                    <label className="field-label">Arredondamento ({l.borderRadius}px)
                      <input type="range" min={0} max={200} value={l.borderRadius} onChange={e=>updateLayer(l.id,{borderRadius:+e.target.value})}/>
                    </label>
                    <div style={{marginTop:12}}>
                      <small className="filter-label">FILTROS</small>
                      <label className="field-label">Brilho ({l.filter.brightness}%)
                        <input type="range" min={0} max={200} value={l.filter.brightness} onChange={e=>updateLayer(l.id,{filter:{...l.filter,brightness:+e.target.value}})}/>
                      </label>
                      <label className="field-label">Contraste ({l.filter.contrast}%)
                        <input type="range" min={0} max={200} value={l.filter.contrast} onChange={e=>updateLayer(l.id,{filter:{...l.filter,contrast:+e.target.value}})}/>
                      </label>
                      <label className="field-label">Saturação ({l.filter.saturation}%)
                        <input type="range" min={0} max={200} value={l.filter.saturation} onChange={e=>updateLayer(l.id,{filter:{...l.filter,saturation:+e.target.value}})}/>
                      </label>
                      <label className="field-label">Desfoque ({l.filter.blur}px)
                        <input type="range" min={0} max={20} value={l.filter.blur} onChange={e=>updateLayer(l.id,{filter:{...l.filter,blur:+e.target.value}})}/>
                      </label>
                    </div>
                    <label className="field-label">Posição X
                      <input type="range" min={-SLIDE_W} max={SLIDE_W} value={l.x} onChange={e=>updateLayer(l.id,{x:+e.target.value})}/>
                    </label>
                    <label className="field-label">Posição Y
                      <input type="range" min={-SLIDE_H} max={SLIDE_H} value={l.y} onChange={e=>updateLayer(l.id,{y:+e.target.value})}/>
                    </label>
                    <label className="field-label">Largura
                      <input type="range" min={100} max={SLIDE_W*2} value={l.width} onChange={e=>updateLayer(l.id,{width:+e.target.value})}/>
                    </label>
                    <button className="danger-btn" onClick={()=>deleteLayer(l.id)}><Trash2/>Remover imagem</button>
                  </>
                );
              })()}
              {!layer && <p className="hint-text">Faça upload de uma imagem para usar como fundo, sobreposição ou elemento no slide.</p>}
            </div>
          )}


          {/* ELEMENTS PANEL */}
          {panel==="elementos" && (
            <div className="props-body">
              <small className="filter-label">FORMAS</small>
              <div className="elem-grid">
                <button onClick={()=>addShape("rect")}><div className="elem-rect"/>Retângulo</button>
                <button onClick={()=>addShape("circle")}><div className="elem-circle"/>Círculo</button>
              </div>
              <small className="filter-label" style={{marginTop:16}}>DECORAÇÕES</small>
              <div className="elem-deco-grid">
                {["→","↗","✦","★","●","■","▲","◆","❝","!"].map(d=>(
                  <button key={d} onClick={()=>{
                    const l: TextLayer = {
                      id:uid(),type:"text",text:d,x:400,y:600,width:200,height:100,
                      fontSize:80,fontFamily:"Arial",fontWeight:"900",fontStyle:"normal",
                      textDecoration:"none",color:"#ffffff",align:"center",
                      lineHeight:1,letterSpacing:0,visible:true,locked:false,zIndex:slide.layers.length+1,
                    };
                    updateSlide(s=>({...s,layers:[...s.layers,l]}));
                    setSelLayer(l.id);setPanel("texto");
                  }}>{d}</button>
                ))}
              </div>
            </div>
          )}

          {/* LAYERS PANEL */}
          {panel==="camadas" && (
            <div className="props-body">
              <div className="layers-list">
                {[...slide.layers].sort((a,b)=>b.zIndex-a.zIndex).map(l => (
                  <div key={l.id} className={`layer-item ${l.id===selLayer?"active":""}`} onClick={()=>setSelLayer(l.id)}>
                    <div className="layer-icon">
                      {l.type==="text"?<Type/>:l.type==="image"?<ImageIcon/>:<Layers/>}
                    </div>
                    <span className="layer-name">
                      {l.type==="text"?(l as TextLayer).text.slice(0,18)+"...":
                       l.type==="image"?"Imagem":
                       `Forma ${(l as ShapeLayer).shape}`}
                    </span>
                    <div className="layer-actions">
                      <button title={l.visible?"Ocultar":"Mostrar"} onClick={e=>{e.stopPropagation();updateLayer(l.id,{visible:!l.visible} as Partial<Layer>);}}>
                        {l.visible?<Eye/>:<EyeOff/>}
                      </button>
                      <button title={l.locked?"Desbloquear":"Bloquear"} onClick={e=>{e.stopPropagation();updateLayer(l.id,{locked:!l.locked} as Partial<Layer>);}}>
                        {l.locked?<Lock/>:<Unlock/>}
                      </button>
                      <button title="Remover" onClick={e=>{e.stopPropagation();deleteLayer(l.id);}}>
                        <Trash2/>
                      </button>
                    </div>
                  </div>
                ))}
                {slide.layers.length===0 && <p className="hint-text">Nenhuma camada. Adicione texto ou formas.</p>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<AuthUser>(null);
  const [page, setPage] = useState("dashboard");
  const [prevPage, setPrevPage] = useState("dashboard");
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);
  const [slides, setSlides] = useState<Slide[]>(DEMO_SLIDES);
  const [selSlide, setSelSlide] = useState(0);
  const [toast, setToast] = useState("");
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem("ps-user");
      if (u) setUser(JSON.parse(u));
      const p = localStorage.getItem("ps-projects");
      if (p) setProjects(JSON.parse(p));
    } catch {}
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(()=>setToast(""),3000); return ()=>clearTimeout(t); }
  }, [toast]);

  const showToast = (m: string) => setToast(m);

  const persist = (p: Project[]) => { setProjects(p); localStorage.setItem("ps-projects",JSON.stringify(p)); };

  const saveProject = () => {
    const p: Project = { id:uid(), title:(slides[0]?.layers[1] as TextLayer|undefined)?.text?.slice(0,60)||"Novo carrossel", status:"Rascunho", updated:"Agora", slides:[...slides] };
    persist([p,...projects]);
    showToast("Carrossel salvo com sucesso!");
  };

  const goTo = (p: string) => {
    setPrevPage(page);
    setPage(p);
    setSideOpen(false);
  };

  const goBack = () => {
    setPage(prevPage);
    setSideOpen(false);
  };

  const handleLogout = () => { localStorage.removeItem("ps-user"); setUser(null); };

  if (!user) return <LoginScreen onLogin={u=>{setUser(u);}} />;

  const credPct = (user.credits/250)*100;

  return (
    <div className={`app-shell ${sideOpen?"side-open":""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-icon"><Sparkles/></div>
            <span>POST<strong>STUDIO</strong></span>
            <button className="close-sidebar" onClick={()=>setSideOpen(false)}><X/></button>
          </div>
          <button className="btn-new" onClick={()=>goTo("studio")}><Plus/>Novo carrossel</button>
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(([id,label,Icon])=>(
              <button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>goTo(id)}>
                <Icon/>
                <span>{label}</span>
                {id==="studio" && <em className="nav-badge">IA</em>}
                {id==="trendings" && <em className="nav-badge hot">HOT</em>}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="credits-card">
            <div className="credits-top"><Zap/><small>Seus créditos</small></div>
            <strong>{user.credits}<span> / 250</span></strong>
            <div className="credits-bar-wrap"><div className="credits-bar-fill" style={{width:`${credPct}%`}}/></div>
            <small>Renova em 18 dias</small>
          </div>
          <div className="sidebar-profile">
            <div className="profile-avatar">{user.avatar}</div>
            <div className="profile-info"><b>{user.name}</b><small>Plano {user.plan}</small></div>
            <button className="icon-btn" onClick={handleLogout} title="Sair"><LogOut/></button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Top header */}
        <header className="main-header">
          <div className="main-header-left">
            <button className="hamburger" onClick={()=>setSideOpen(true)}><Menu/></button>
            <div className="header-search">
              <Search/>
              <input placeholder="Buscar carrosséis, templates..."/>
            </div>
          </div>
          <div className="main-header-right">
            <button className="icon-btn"><Bell/></button>
            <div className="header-avatar" title={user.name}>{user.avatar}</div>
          </div>
        </header>
        <div className="page-top-bar"/>

        {/* Pages */}
        {page==="dashboard" && <Dashboard go={goTo} projects={projects} user={user}/>}
        {page==="studio" && <Studio onDone={(s, _scripts) => {setSlides(s);setSelSlide(0);goTo("editor");showToast("Roteiro gerado! Abra o editor e faça upload das imagens.");}}/>}
        {page==="editor" && <Editor slides={slides} setSlides={setSlides} selSlide={selSlide} setSelSlide={setSelSlide} onSave={saveProject} onToast={showToast} onBack={goBack}/>}
        {page==="templates" && <Templates onUse={tpl=>{const s=[makeSlideFromTemplate(tpl),...Array.from({length:4},()=>makeSlideFromTemplate(tpl))];setSlides(s);setSelSlide(0);goTo("editor");showToast("Template aplicado!");}}/>}
        {page==="trendings" && <Trendings onGenerate={_title=>{goTo("studio");}}/>}
        {page==="organizacao" && <Organizacao projects={projects} onOpen={p=>{setSlides(p.slides);setSelSlide(0);goTo("editor");}} onDelete={id=>persist(projects.filter(p=>p.id!==id))}/>}
        {page==="calendario" && <CalendarPage/>}
        {page==="members" && <MembersPage/>}
        {page==="configuracoes" && <Configuracoes user={user}/>}
      </main>

      {/* Toast */}
      {toast && (
        <div className="toast-notif">
          <Check/>{toast}
        </div>
      )}

      {/* Mobile overlay */}
      {sideOpen && <div className="sidebar-overlay" onClick={()=>setSideOpen(false)}/>}
    </div>
  );

}

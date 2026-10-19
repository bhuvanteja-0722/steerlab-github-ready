import { useEffect, useMemo, useState, type ReactElement } from 'react'

type Format = 'carousel' | 'static' | 'reel'
type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'edited'

type Claim = {
  id: string
  title: string
  text: string
  source: string
  pointer: string
  risk: 'high' | 'medium' | 'low'
  status: ReviewStatus
}

const stages = [
  { label: 'Ingest', detail: 'PDF + paper metadata' },
  { label: 'Extract', detail: 'Claims, numbers, caveats' },
  { label: 'Translate', detail: 'Plain English, Steer voice' },
  { label: 'Create', detail: 'Carousel, static, reel' },
  { label: 'Safety check', detail: 'Doctor review required' },
]

const claimsSeed: Claim[] = [
  {
    id: 'P1-C3',
    title: 'Weight regain after withdrawal',
    text: 'Participants regained an average of 11.6 percentage points of prior weight loss by week 120.',
    source: 'STEP 1 extension',
    pointer: 'Abstract · Results',
    risk: 'high',
    status: 'pending',
  },
  {
    id: 'P2-C2',
    title: 'Lean mass is not muscle mass',
    text: 'Lean mass can include muscle, organs, bone, fluids and water in fat tissue.',
    source: 'Neeland et al. review',
    pointer: 'Abstract · Lean mass versus muscle mass',
    risk: 'medium',
    status: 'pending',
  },
  {
    id: 'P3-C1',
    title: 'Protein guidance needs context',
    text: 'The review lists 1.2–1.6 g/kg/day as a consideration when exercise is incorporated.',
    source: 'Musculoskeletal health review',
    pointer: 'Key elements of dietary strategies',
    risk: 'high',
    status: 'pending',
  },
  {
    id: 'P1-C6',
    title: 'Extension study limitation',
    text: 'The off-treatment extension analysis was exploratory and included 327 participants.',
    source: 'STEP 1 extension',
    pointer: 'Abstract · Materials and methods',
    risk: 'low',
    status: 'pending',
  },
]

const carouselSlides = [
  { kicker: 'what research says', title: 'If weight comes back, did you fail?', body: 'Maybe the plan ended too soon.', tone: 'maroon' },
  { kicker: 'the setup', title: 'A 68-week study, then a year without treatment.', body: 'Adults with overweight or obesity were followed after treatment and lifestyle support stopped.', tone: 'cream' },
  { kicker: 'the number', title: '11.6 percentage points', body: 'That was the average amount of prior weight loss regained by week 120 in the extension analysis.', tone: 'rust' },
  { kicker: 'the meaning', title: 'Not a character test.', body: 'The authors point to obesity as a chronic condition — not a failure of willpower.', tone: 'cream' },
  { kicker: 'the plan', title: 'Maintenance needs a plan too.', body: 'Support, monitoring, habits, muscle and a safe next phase belong in the conversation.', tone: 'maroon' },
]

const formatLabels: Record<Format, string> = { carousel: 'Carousel', static: 'Static post', reel: 'AI reel' }

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const paths: Record<string, ReactElement> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    file: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4" /><path d="M9 13h6M9 16h5" /></>,
    link: <><path d="M10 13.5 14 9.5" /><path d="M7.5 16.5H6a3.5 3.5 0 0 1 0-7h3" /><path d="M16.5 7.5H18a3.5 3.5 0 0 1 0 7h-3" /></>,
    play: <path d="m9 6 9 6-9 6z" fill="currentColor" stroke="none" />,
    sparkle: <><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6z" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 19h14" /></>,
    pencil: <><path d="m4 16.5-.8 3.3 3.3-.8L18 7.5 15.5 5z" /><path d="m14.5 6 3.5 3.5" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
  }
  return <svg {...common}>{paths[name] ?? paths.grid}</svg>
}

function App() {
  const [selectedFormat, setSelectedFormat] = useState<Format>('carousel')
  const [slide, setSlide] = useState(0)
  const [runState, setRunState] = useState<'ready' | 'running' | 'complete'>('complete')
  const [stageIndex, setStageIndex] = useState(4)
  const [paperUrl, setPaperUrl] = useState('https://pubmed.ncbi.nlm.nih.gov/35441470/')
  const [paperName, setPaperName] = useState('STEP 1 extension + 2 supporting reviews')
  const [claims, setClaims] = useState<Claim[]>(claimsSeed)
  const [activeSection, setActiveSection] = useState('Workspace')
  const [toast, setToast] = useState('')
  const [savedUrl, setSavedUrl] = useState('https://pubmed.ncbi.nlm.nih.gov/35441470/')
  const [uploadedFileName, setUploadedFileName] = useState('')

  useEffect(() => {
    if (runState !== 'running') return
    const timer = window.setTimeout(() => {
      if (stageIndex < stages.length - 1) {
        setStageIndex((value) => value + 1)
      } else {
        setRunState('complete')
        setToast('Content pack ready for doctor review')
      }
    }, 820)
    return () => window.clearTimeout(timer)
  }, [runState, stageIndex])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const reviewedCount = useMemo(() => claims.filter((claim) => claim.status !== 'pending').length, [claims])
  const approvedCount = useMemo(() => claims.filter((claim) => claim.status === 'approved' || claim.status === 'edited').length, [claims])
  const readyToPublish = reviewedCount === claims.length && approvedCount === claims.length

  function startPipeline() {
    setStageIndex(0)
    setRunState('running')
    setToast('Pipeline started — watching the evidence move through the system')
  }

  function handleFile(file?: File) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setToast('Please choose a PDF file.')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      setToast('That PDF is larger than the 25 MB demo limit.')
      return
    }
    setUploadedFileName(file.name)
    setPaperName(file.name)
    setRunState('ready')
    setStageIndex(0)
    setToast('PDF selected. This demo does not extract PDF text yet; the sample evidence remains in use.')
  }

  function savePaperUrl() {
    try {
      const parsed = new URL(paperUrl.trim())
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid protocol')
      setSavedUrl(parsed.toString())
      setPaperName(parsed.hostname + parsed.pathname)
      setRunState('ready')
      setStageIndex(0)
      setToast('Paper URL saved. Run the demo to preview the sample workflow.')
    } catch {
      setToast('Enter a valid http:// or https:// paper URL.')
    }
  }

  function downloadFile(filename: string, content: string, type = 'application/json') {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  function exportPack() {
    const pack = {
      project: 'Steer Lab',
      generatedAt: new Date().toISOString(),
      mode: 'prototype-simulated-workflow',
      source: { name: paperName, submittedUrl: savedUrl, uploadedPdfName: uploadedFileName || null },
      publicationReady: readyToPublish,
      claims: claims.map(({ id, title, text, source, pointer, risk, status }) => ({ id, title, text, source, pointer, risk, status })),
      content: {
        carousel: { title: 'The part of weight loss nobody talks about', slides: carouselSlides, caption: 'The scale is not a character test. Research shows why long-term support and a planned maintenance phase matter.', hashtags: ['#MetabolicHealth', '#DoctorLedCare', '#SteerClub'] },
        static: { title: 'Lean mass is not the same as muscle', caption: 'Lean mass and muscle mass are related, but not interchangeable. One scan is useful. It is not the whole story.' },
        reel: { title: 'Your 3 pm chai is not the villain', scenes: [{ time: '00:00', label: 'Hook', notes: 'Indian kitchen, chai + dal / Weight loss is not just a smaller number.' }, { time: '00:08', label: 'Evidence', notes: 'Plate line drawing / Protein + resistance exercise can support lean mass.' }, { time: '00:22', label: 'Close', notes: 'Doctor review / Your target is personal.' }], caption: 'Muscle care belongs in the plan from day one. Your nutrition and activity targets are personal.' }
      },
      disclaimer: 'Prototype export. Claims and citations require verification against original publications and clinical review before publication.'
    }
    downloadFile('steer-lab-content-pack.json', JSON.stringify(pack, null, 2))
    setToast(readyToPublish ? 'Content pack downloaded as JSON.' : 'Draft content pack downloaded. Review all claims before publication.')
  }

  function goToSection(item: string) {
    setActiveSection(item)
    const targetId = item === 'Workspace' ? 'workspace-top' : item === 'Evidence' ? 'evidence' : item === 'Content pack' ? 'content-pack' : 'review-queue'
    window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  function updateClaim(id: string, status: ReviewStatus) {
    setClaims((items) => items.map((claim) => claim.id === id ? { ...claim, status } : claim))
  }

  function editClaim(claim: Claim) {
    const nextText = window.prompt('Edit this claim before approval:', claim.text)
    if (nextText && nextText.trim() !== claim.text) {
      setClaims((items) => items.map((item) => item.id === claim.id ? { ...item, text: nextText.trim(), status: 'edited' } : item))
      setToast(`${claim.id} edited and marked for approval`)
    }
  }


  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><span className="brand-mark">s</span><span>steer<span className="brand-dot">.</span>lab</span></div>
        <div className="workspace-label">content workspace</div>
        <nav className="nav-list" aria-label="Primary navigation">
          {['Workspace', 'Evidence', 'Content pack', 'Review queue'].map((item, index) => (
            <button key={item} className={`nav-item ${activeSection === item ? 'active' : ''}`} onClick={() => goToSection(item)}>
              <span className="nav-icon"><Icon name={['grid', 'file', 'sparkle', 'shield'][index]} size={17} /></span>
              <span>{item}</span>
              {item === 'Review queue' && <span className="nav-count">{claims.length - reviewedCount}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quality-card">
            <div className="quality-icon"><Icon name="shield" size={17} /></div>
            <div><strong>Doctor-led by design</strong><p>Every claim stays linked to its source.</p></div>
          </div>
          <div className="user-chip"><span className="avatar">AK</span><span><strong>Alex K.</strong><small>Builder preview</small></span><span className="more">•••</span></div>
        </div>
      </aside>

      <main className="main-content" id="workspace-top">
        <header className="topbar">
          <div><span className="eyebrow">Steer content engine / {activeSection.toLowerCase()}</span><h1>From paper to posts.</h1></div>
          <div className="top-actions"><span className="status-pill"><span className="status-dot" /> {runState === 'running' ? 'Pipeline running' : 'Pipeline ready'}</span><button className="icon-button" aria-label="Notifications">◌</button><button className="avatar avatar-top">AK</button></div>
        </header>

        <section className="intro-row">
          <div><p className="lede">Research in. Source-traceable content out.</p><p className="muted-copy">A small, repeatable engine for turning metabolic-health evidence into content a doctor can trust — and a real person can understand.</p></div>
          <div className="intro-actions"><button className="ghost-button" onClick={() => setToast('Sample batch includes 3 papers and 9 evidence-backed claims')}><Icon name="file" size={16} /> View batch</button><button className="primary-button" onClick={startPipeline}><Icon name="play" size={14} /> Run demo pipeline</button></div>
        </section>

        <section className="metric-strip">
          <div className="metric"><span className="metric-number">03</span><span><strong>Papers in batch</strong><small>one source, three angles</small></span></div>
          <div className="metric"><span className="metric-number">09</span><span><strong>Traceable claims</strong><small>each linked to a pointer</small></span></div>
          <div className="metric"><span className="metric-number">01</span><span><strong>Doctor review gate</strong><small>before anything ships</small></span></div>
          <div className={`metric readiness ${readyToPublish ? 'ready' : ''}`}><span className="metric-icon"><Icon name={readyToPublish ? 'check' : 'clock'} size={18} /></span><span><strong>{readyToPublish ? 'Ready to publish' : 'Review in progress'}</strong><small>{reviewedCount} of {claims.length} claims reviewed</small></span></div>
        </section>

        <section className="workspace-grid">
          <div className="left-column">
            <section className="panel intake-panel">
              <div className="panel-heading"><div><span className="section-kicker">01 / research intake</span><h2>Give the engine something worth saying.</h2></div><span className="demo-badge">demo batch</span></div>
              <div className="intake-body">
                <label className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleFile(event.dataTransfer.files?.[0]) }}>
                  <input type="file" accept=".pdf" onChange={(event) => handleFile(event.target.files?.[0])} />
                  <span className="upload-orb"><Icon name="upload" size={19} /></span><span className="drop-title">Drop a paper here or <u>browse files</u></span><span className="drop-note">PDF up to 25 MB · OCR supported</span>
                </label>
                <div className="or-divider"><span>or paste a paper URL</span></div>
                <div className="url-row"><div className="url-field"><Icon name="link" size={16} /><input value={paperUrl} onChange={(event) => setPaperUrl(event.target.value)} aria-label="Paper URL" /></div><button className="small-button" onClick={savePaperUrl}>Save</button></div>
                <div className="selected-source"><span className="source-file-icon"><Icon name="file" size={16} /></span><span><strong>{paperName}</strong><small>{uploadedFileName ? `Selected PDF: ${uploadedFileName} · sample evidence still in use` : `Demo source · ${savedUrl}`}</small></span><span className="source-ok"><Icon name="check" size={13} /> ready</span></div>
              </div>
            </section>

            <section className="panel pipeline-panel">
              <div className="panel-heading"><div><span className="section-kicker">02 / pipeline</span><h2>Watch the evidence travel.</h2></div><span className="time-label"><Icon name="clock" size={14} /> 08–12 min compute</span></div>
              <div className="pipeline-track">
                {stages.map((stage, index) => { const done = index < stageIndex || runState === 'complete'; const current = runState === 'running' && index === stageIndex; return <div className={`stage ${done ? 'done' : ''} ${current ? 'current' : ''}`} key={stage.label}><div className="stage-marker">{done ? <Icon name="check" size={14} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><div className="stage-copy"><strong>{stage.label}</strong><small>{stage.detail}</small></div>{index < stages.length - 1 && <div className={`stage-line ${done ? 'filled' : ''}`} />}</div> })}
              </div>
              <div className="pipeline-foot"><span><span className={`pulse ${runState === 'running' ? 'active' : ''}`} />{runState === 'complete' ? 'Pack ready for review' : runState === 'ready' ? 'Paper waiting to be run' : `Working on ${stages[stageIndex].label.toLowerCase()}…`}</span><button className="text-button" onClick={startPipeline} disabled={runState === 'running'}>{runState === 'running' ? 'Running…' : 'Run again'} <Icon name="arrow" size={14} /></button></div>
            </section>

            <section className="panel content-panel" id="content-pack">
              <div className="panel-heading"><div><span className="section-kicker">03 / generated content pack</span><h2>One evidence base. Three ways in.</h2></div><span className="source-count"><Icon name="link" size={14} /> 12 source links</span></div>
              <div className="format-tabs">{(['carousel', 'static', 'reel'] as Format[]).map((format) => <button key={format} className={selectedFormat === format ? 'selected' : ''} onClick={() => setSelectedFormat(format)}>{formatLabels[format]}<span className="tab-dot" /></button>)}</div>
              <div className="content-preview-grid">
                <div className="preview-frame">
                  {selectedFormat === 'carousel' && <div className={`social-preview carousel-preview tone-${carouselSlides[slide].tone}`}><div className="social-top"><span>steer</span><span>{slide + 1} / {carouselSlides.length}</span></div><div className="carousel-copy"><span className="preview-kicker">{carouselSlides[slide].kicker}</span><h3>{carouselSlides[slide].title}</h3><p>{carouselSlides[slide].body}</p></div><div className="preview-footer"><span>source-traceable</span><span>steerclub.com</span></div></div>}
                  {selectedFormat === 'static' && <div className="social-preview static-preview"><div className="static-stamp">field note / 02</div><div className="static-copy"><h3>Lean mass<br /><em>≠</em> muscle mass</h3><p>A DEXA scan’s “lean mass” can include muscle, organs, bone, fluids and water in fat tissue.</p><span className="static-question">The better question:<br /><strong>what happened to strength and function?</strong></span></div><div className="preview-footer"><span>steer</span><span>steerclub.com</span></div></div>}
                  {selectedFormat === 'reel' && <div className="social-preview reel-preview"><div className="reel-screen"><div className="reel-play"><Icon name="play" size={20} /></div><span className="reel-time">00:28</span><span className="reel-scene">shot 04 / 07</span></div><div className="reel-caption">Your 3pm chai is not the villain.</div><div className="reel-bottom"><span>AI reel · subtitles on</span><span>steer</span></div></div>}
                </div>
                <div className="content-copy">
                  <div className="preview-meta"><div><span className="content-type">{formatLabels[selectedFormat]}</span><h3>{selectedFormat === 'carousel' ? 'The part of weight loss nobody talks about' : selectedFormat === 'static' ? 'Lean mass is not the same as muscle' : 'Your 3 pm chai is not the villain'}</h3></div><span className="approval-tag"><Icon name="shield" size={13} /> draft</span></div>
                  {selectedFormat === 'carousel' && <><p className="content-reasoning">A clear answer to the question: “If weight comes back, did I fail?” The number stays precise, the limitation stays visible.</p><div className="slide-controls"><button onClick={() => setSlide((value) => Math.max(0, value - 1))} disabled={slide === 0}>←</button><span>{slide + 1} of {carouselSlides.length}</span><button onClick={() => setSlide((value) => Math.min(carouselSlides.length - 1, value + 1))} disabled={slide === carouselSlides.length - 1}>→</button></div></>}
                  {selectedFormat === 'static' && <p className="content-reasoning">A saveable mental model for a nuanced topic. It points people from one scary scan number toward body composition, strength and function.</p>}
                  {selectedFormat === 'reel' && <div className="scene-list"><div><span>00:00</span><strong>Hook</strong><small>Indian kitchen, chai + dal / “Weight loss is not just a smaller number.”</small></div><div><span>00:08</span><strong>Evidence</strong><small>Plate line drawing / “Protein + resistance exercise can support lean mass.”</small></div><div><span>00:22</span><strong>Close</strong><small>Doctor review / “Your target is personal.”</small></div></div>}
                  <div className="caption-box"><span className="caption-label">caption + hashtags</span><p>{selectedFormat === 'carousel' ? 'The scale is not a character test. Research shows why long-term support and a planned maintenance phase matter.' : selectedFormat === 'static' ? 'Lean mass and muscle mass are related, but not interchangeable. One scan is useful. It is not the whole story.' : 'Muscle care belongs in the plan from day one. The practical version can be very Indian: dal, dahi, paneer, eggs, fish — and repeatable resistance work.'}</p><div className="hashtags">#MetabolicHealth&nbsp;&nbsp; #DoctorLedCare&nbsp;&nbsp; #SteerClub</div></div>
                  <div className="linked-source"><span><Icon name="link" size={14} /> linked source</span><button onClick={() => setActiveSection('Evidence')}>{selectedFormat === 'carousel' ? 'STEP 1 extension · Abstract / Results' : selectedFormat === 'static' ? 'Neeland et al. · Abstract' : 'Musculoskeletal health review · Key elements'} <Icon name="arrow" size={13} /></button></div>
                </div>
              </div>
            </section>
          </div>

          <aside className="right-column">
            <section className="panel review-panel" id="review-queue">
              <div className="panel-heading"><div><span className="section-kicker">04 / doctor review</span><h2>Nothing ships unchecked.</h2></div><span className="queue-count">{claims.length - reviewedCount} open</span></div>
              <p className="review-intro">Every factual line arrives with its paper pointer. Approve, edit or reject before it moves to Canva or a scheduler.</p>
              <div className="review-progress"><div><span>review progress</span><strong>{reviewedCount}/{claims.length}</strong></div><div className="progress-bar"><span style={{ width: `${(reviewedCount / claims.length) * 100}%` }} /></div></div>
              <div className="claim-list">{claims.map((claim) => <article className={`claim-card ${claim.status}`} key={claim.id}><div className="claim-top"><span className={`risk-dot ${claim.risk}`} /> <span className="claim-id">{claim.id}</span><span className={`status-label ${claim.status}`}>{claim.status === 'pending' ? 'needs review' : claim.status}</span></div><h3>{claim.title}</h3><p>{claim.text}</p><div className="claim-source"><Icon name="link" size={13} /><span>{claim.source}<small>{claim.pointer}</small></span></div><div className="claim-actions"><button className="edit-action" onClick={() => editClaim(claim)}><Icon name="pencil" size={13} /> Edit</button><button className="reject-action" onClick={() => updateClaim(claim.id, 'rejected')}>Reject</button><button className="approve-action" onClick={() => updateClaim(claim.id, 'approved')}><Icon name="check" size={13} /> Approve</button></div></article>)}</div>
              <div className="review-footer"><div className={`publish-state ${readyToPublish ? 'publish-ready' : ''}`}><span className="state-check"><Icon name={readyToPublish ? 'check' : 'clock'} size={14} /></span><span><strong>{readyToPublish ? 'All claims approved' : 'Approval required'}</strong><small>{readyToPublish ? 'This pack can move to export.' : 'Clinical review protects the audience.'}</small></span></div><button className="export-button" onClick={exportPack}>Download JSON pack <Icon name="arrow" size={14} /></button></div>
            </section>

            <section className="panel evidence-panel" id="evidence">
              <div className="panel-heading"><div><span className="section-kicker">source library</span><h2>Evidence, not vibes.</h2></div><span className="source-count">03 papers</span></div>
              <div className="evidence-list"><div className="evidence-row"><span className="paper-index">01</span><span><strong>STEP 1 extension</strong><small>Weight regain after withdrawal</small></span><a className="evidence-link" href="https://pubmed.ncbi.nlm.nih.gov/35441470/" target="_blank" rel="noreferrer" aria-label="Open STEP 1 extension paper"><Icon name="link" size={13} /></a></div><div className="evidence-row"><span className="paper-index">02</span><span><strong>Lean body mass review</strong><small>Why lean mass ≠ muscle</small></span><a className="evidence-link" href="https://pubmed.ncbi.nlm.nih.gov/?term=lean+body+mass+muscle+mass+review" target="_blank" rel="noreferrer" aria-label="Search lean body mass review"><Icon name="link" size={13} /></a></div><div className="evidence-row"><span className="paper-index">03</span><span><strong>Musculoskeletal health review</strong><small>Protein + movement context</small></span><a className="evidence-link" href="https://pubmed.ncbi.nlm.nih.gov/?term=protein+resistance+exercise+musculoskeletal+health+review" target="_blank" rel="noreferrer" aria-label="Search protein and resistance exercise review"><Icon name="link" size={13} /></a></div></div>
              <button className="small-button source-sheet-button" onClick={() => downloadFile('steer-lab-source-sheet.csv', 'claim_id,title,claim,source,pointer,risk,status,source_url\n' + claims.map(c => [c.id,c.title,c.text,c.source,c.pointer,c.risk,c.status,c.id.startsWith('P1') ? 'https://pubmed.ncbi.nlm.nih.gov/35441470/' : c.id.startsWith('P2') ? 'https://pubmed.ncbi.nlm.nih.gov/?term=lean+body+mass+muscle+mass+review' : 'https://pubmed.ncbi.nlm.nih.gov/?term=protein+resistance+exercise+musculoskeletal+health+review'].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n'), 'text/csv')}>Download source sheet (CSV)</button><div className="evidence-note"><span className="note-mark">“</span><p>When the evidence is mixed, say what we know — and what we do not.</p></div>
            </section>
          </aside>
        </section>
        <footer className="footer-note"><span>Steer Lab / internal demo</span><span>Clinical weight loss, doctor-led.</span><span>Built for a weekly content flow</span></footer>
      </main>
      {toast && <div className="toast"><span className="toast-check"><Icon name="check" size={13} /></span>{toast}</div>}
    </div>
  )
}

export default App

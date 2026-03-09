export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { width: 100%; height: 100%; min-height: 100vh; }

  :root {
    --bg: #f5f4f0;
    --surface: #ffffff;
    --surface2: #f0ede8;
    --border: #e8e4de;
    --text-primary: #0d0d0d;
    --text-secondary: #6b6b6b;
    --text-muted: #a8a8a8;
    --sidebar-bg: #0f0f1a;
    --accent-purple: #6366f1;
    --accent-green: #10b981;
    --accent-amber: #f59e0b;
    --accent-red: #ef4444;
    --sidebar-w: 260px;
    --header-h: 64px;
  }

  /* ── LAYOUT SHELL ── */
  .app-shell {
    display: flex;
    width: 100vw;
    height: 100vh;
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  .shell-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    min-width: var(--sidebar-w);
    height: 100vh;
    background: var(--sidebar-bg);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    z-index: 10;
  }

  .sidebar::before {
    content: '';
    position: absolute;
    top: -100px; left: -100px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .sidebar::after {
    content: '';
    position: absolute;
    bottom: -80px; right: -80px;
    width: 250px; height: 250px;
    background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .sidebar-brand {
    padding: 22px 18px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    position: relative; z-index: 2;
  }

  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
  }

  .sidebar-logo-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #6366f1, #10b981);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .sidebar-logo-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 15px; color: #fff;
  }

  .sidebar-logo-sub {
    font-size: 10px; color: rgba(255,255,255,0.3);
    letter-spacing: 1px; text-transform: uppercase; margin-top: 1px;
  }

  .role-badge {
    margin-top: 12px;
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px; padding: 4px 10px;
  }

  .role-dot { width: 6px; height: 6px; border-radius: 50%; }

  .role-text {
    font-size: 11px; color: rgba(255,255,255,0.4);
    letter-spacing: 0.8px; text-transform: uppercase;
  }

  .sidebar-nav {
    flex: 1; padding: 14px 10px;
    overflow-y: auto; position: relative; z-index: 2;
  }

  .nav-section {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,0.18); padding: 10px 10px 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
    cursor: pointer; margin-bottom: 1px;
    transition: all 0.15s ease;
    color: rgba(255,255,255,0.4);
    font-size: 13.5px; font-weight: 400;
    border: 1px solid transparent;
    position: relative;
    user-select: none;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8);
  }

  .nav-item.active {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.25);
    color: #a5b4fc;
  }

  .nav-item.active svg { color: #6366f1; }

  .nav-icon { width: 16px; height: 16px; flex-shrink: 0; }

  .nav-badge {
    margin-left: auto;
    background: #ef4444; color: #fff;
    font-size: 10px; padding: 1px 6px;
    border-radius: 100px; font-weight: 600;
  }

  .sidebar-footer {
    padding: 14px 10px;
    border-top: 1px solid rgba(255,255,255,0.05);
    position: relative; z-index: 2;
  }

  .user-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: 8px;
    background: rgba(255,255,255,0.03);
    margin-bottom: 8px;
  }

  .avatar {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #10b981);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 12px; color: #fff;
    flex-shrink: 0;
  }

  .avatar-lg {
    width: 36px; height: 36px;
    border-radius: 9px; font-size: 13px;
  }

  .user-name { font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 500; }
  .user-email { font-size: 11px; color: rgba(255,255,255,0.28); }

  .logout-btn {
    width: 100%; padding: 9px;
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.12);
    border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    color: rgba(239,68,68,0.65); font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s ease; letter-spacing: 0.5px;
  }

  .logout-btn:hover { background: rgba(239,68,68,0.14); color: #ef4444; }

  /* ── HEADER ── */
  .app-header {
    height: var(--header-h);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 28px; gap: 16px;
    flex-shrink: 0;
  }

  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px; font-weight: 700;
    color: var(--text-primary); flex: 1;
  }

  .header-search {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 14px; width: 220px;
  }

  .header-search input {
    border: none; background: none; outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--text-primary); width: 100%;
  }

  .header-search input::placeholder { color: var(--text-muted); }

  .header-actions { display: flex; align-items: center; gap: 10px; }

  .icon-btn {
    width: 36px; height: 36px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary); transition: all 0.15s;
    position: relative;
  }

  .icon-btn:hover { background: var(--border); }

  .notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #ef4444; border-radius: 50%;
    border: 1.5px solid var(--surface);
  }

  /* ── PAGE CONTENT ── */
  .page-content {
    flex: 1; overflow-y: auto; padding: 28px;
  }

  .page-header { margin-bottom: 28px; }

  .page-eyebrow {
    font-size: 11px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;
  }

  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    color: var(--text-primary); line-height: 1.2;
  }

  .page-title span {
    background: linear-gradient(90deg, #6366f1, #10b981);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── COMMON CARDS ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 24px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 20px;
    position: relative; overflow: hidden;
    animation: fadeUp 0.4s ease forwards; opacity: 0;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }

  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.1s; }
  .stat-card:nth-child(3) { animation-delay: 0.15s; }
  .stat-card:nth-child(4) { animation-delay: 0.2s; }

  .stat-card-bg {
    position: absolute; top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 0 14px 0 80px; opacity: 0.08;
  }

  .stat-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; margin-bottom: 16px;
  }

  .stat-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }

  .trend {
    font-size: 11px; font-weight: 500;
    padding: 3px 8px; border-radius: 100px;
  }

  .trend-up { background: #d1fae5; color: #065f46; }
  .trend-down { background: #fee2e2; color: #991b1b; }
  .trend-neutral { background: #fef3c7; color: #92400e; }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 32px; font-weight: 800;
    color: var(--text-primary); line-height: 1; margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.8px;
  }

  /* ── PANEL ── */
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    animation: fadeUp 0.4s ease forwards; opacity: 0;
  }

  .panel:nth-child(1) { animation-delay: 0.25s; }
  .panel:nth-child(2) { animation-delay: 0.3s; }
  .panel:nth-child(3) { animation-delay: 0.35s; }

  .panel-header {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700; color: var(--text-primary);
  }

  .panel-action {
    font-size: 12px; color: #6366f1; cursor: pointer;
    font-weight: 500; background: none; border: none;
    font-family: 'DM Sans', sans-serif;
  }

  .panel-action:hover { text-decoration: underline; }

  /* ── TABLE ── */
  .data-table { width: 100%; border-collapse: collapse; }

  .data-table th {
    text-align: left; padding: 10px 20px;
    font-size: 11px; letter-spacing: 1px;
    text-transform: uppercase; color: var(--text-muted);
    border-bottom: 1px solid var(--border);
    font-weight: 500; background: var(--surface2);
  }

  .data-table td {
    padding: 13px 20px; font-size: 13.5px;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }

  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: var(--surface2); }

  .item-cell { display: flex; align-items: center; gap: 10px; }

  .item-thumb {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; background: var(--surface2);
  }

  .item-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  /* ── STATUS BADGE ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 500;
  }

  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }

  .badge-instore  { background: #d1fae5; color: #065f46; }
  .badge-instore  .badge-dot { background: #10b981; }
  .badge-borrowed { background: #fef3c7; color: #92400e; }
  .badge-borrowed .badge-dot { background: #f59e0b; }
  .badge-damaged  { background: #fee2e2; color: #991b1b; }
  .badge-damaged  .badge-dot { background: #ef4444; }
  .badge-missing  { background: #f3e8ff; color: #6b21a8; }
  .badge-missing  .badge-dot { background: #a855f7; }

  /* ── ACTIVITY ── */
  .activity-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: var(--surface2); }

  .activity-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 14px;
  }

  .activity-text { font-size: 13px; color: var(--text-primary); line-height: 1.4; }
  .activity-text strong { font-weight: 600; }
  .activity-time { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

  /* ── QUICK ACTIONS ── */
  .quick-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; padding: 16px;
  }

  .quick-btn {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px; padding: 16px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px; cursor: pointer;
    transition: all 0.15s ease;
    font-family: 'DM Sans', sans-serif; text-align: center;
  }

  .quick-btn:hover { background: var(--sidebar-bg); border-color: var(--sidebar-bg); }
  .quick-btn:hover .quick-icon { background: rgba(255,255,255,0.08); color: #fff; }
  .quick-btn:hover .quick-label { color: rgba(255,255,255,0.6); }

  .quick-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: var(--border); font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-secondary); transition: all 0.15s;
  }

  .quick-label {
    font-size: 12px; color: var(--text-secondary);
    font-weight: 500; transition: color 0.15s; line-height: 1.3;
  }

  /* ── BORROW LIST ── */
  .borrow-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
  }

  .borrow-item:last-child { border-bottom: none; }
  .borrow-info { flex: 1; min-width: 0; }
  .borrow-name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
  .borrow-detail { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  .action-btn {
    padding: 5px 12px; border-radius: 6px;
    font-size: 11px; font-weight: 600;
    cursor: pointer; border: none;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s; letter-spacing: 0.3px;
  }

  .btn-return { background: #d1fae5; color: #065f46; }
  .btn-return:hover { background: #10b981; color: #fff; }
  .btn-borrow { background: #ede9fe; color: #4f46e5; }
  .btn-borrow:hover { background: #6366f1; color: #fff; }

  /* ── STORAGE ── */
  .storage-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }

  .storage-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 14px;
  }

  .storage-top {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 8px;
  }

  .storage-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .storage-count { font-size: 11px; color: var(--text-muted); }

  .storage-bar { height: 5px; background: var(--border); border-radius: 100px; overflow: hidden; }

  .storage-fill {
    height: 100%; border-radius: 100px;
    background: linear-gradient(90deg, #6366f1, #10b981);
  }

  /* ── GRID LAYOUTS ── */
  .two-col { display: grid; grid-template-columns: 1fr 340px; gap: 20px; }
  .col { display: flex; flex-direction: column; gap: 20px; }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 1100px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .two-col { grid-template-columns: 1fr; }
  }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .header-search { display: none; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;
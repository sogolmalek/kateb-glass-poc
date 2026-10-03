const main = document.querySelector('#main');
const modalRoot = document.querySelector('#modalRoot');
const toastRegion = document.querySelector('#toastRegion');

const iconPaths = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5.5h5V20"/>',
  sparkle: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/>',
  tracking: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  work: '<rect x="4" y="6.5" width="16" height="12" rx="2"/><path d="M9 6.5V4h6v2.5M4 11h16M10 11v2h4v-2"/>',
  dashboard: '<rect x="4" y="4" width="6" height="7" rx="1"/><rect x="14" y="4" width="6" height="4" rx="1"/><rect x="4" y="15" width="6" height="5" rx="1"/><rect x="14" y="12" width="6" height="8" rx="1"/>',
  property: '<path d="m4 11 8-6 8 6"/><path d="M6 10v9h12v-9M9 19v-5h6v5"/>',
  verify: '<path d="M7 3.5h8l3 3V20H7z"/><path d="M15 3.5V7h3M10 12l1.5 1.5L15 10"/>',
  document: '<path d="M7 3.5h8l3 3V20H7z"/><path d="M15 3.5V7h3M10 11h5M10 14h5M10 17h3"/>',
  calculator: '<rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14h.01M12 14h.01M15 14h.01M9 17h.01M12 17h3"/>',
  share: '<circle cx="6" cy="12" r="2"/><circle cx="17" cy="6" r="2"/><circle cx="17" cy="18" r="2"/><path d="m8 11 7-4M8 13l7 4"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/>',
  pin: '<path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
  upload: '<path d="M12 16V5M8 9l4-4 4 4"/><path d="M5 15v4h14v-4"/>',
  payment: '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M3.5 10h17M7 15h3"/>',
  legal: '<path d="M12 4v16M7 7h10M6 7l-3 6h6L6 7ZM18 7l-3 6h6l-3-6ZM8 20h8"/>',
  check: '<path d="m6 12.5 3.5 3.5L18 7.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  bell: '<path d="M6.5 16.5h11l-1.5-2V10a4 4 0 0 0-8 0v4.5l-1.5 2ZM10 19h4"/>',
  office: '<path d="M5 20V5h9v15M14 10h5v10M8 8h3M8 11h3M8 14h3M8 17h3M16.5 13h.01M16.5 16h.01"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};

function iconSvg(name) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.sparkle}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]:not([data-icon-ready])').forEach((node) => {
    node.innerHTML = iconSvg(node.dataset.icon);
    node.setAttribute('data-icon-ready', 'true');
  });
}

new MutationObserver(() => hydrateIcons()).observe(document.body, { childList: true, subtree: true });

const state = {
  view: 'home',
  step: 0,
  kyc: false,
  uploads: new Set(['هویتی']),
  paid: false,
  submitted: false,
  experts: { survey: false, legal: false, registry: false },
  sent: false,
  defect: false,
  final: false,
};

const stages = [
  { title: 'ثبت درخواست', short: 'درخواست', icon: 'sparkle', note: 'انتخاب نوع خدمت و تشکیل پیش‌نویس' },
  { title: 'احراز هویت متقاضی', short: 'هویت', icon: 'verify', note: 'خروج از سامانه به درگاه همکار' },
  { title: 'مشخصات متقاضی', short: 'متقاضی', icon: 'user', note: 'اطلاعات حقیقی، حقوقی یا نماینده' },
  { title: 'ملک و موقعیت مکانی', short: 'ملک و نقشه', icon: 'pin', note: 'پلاک ثبتی، حدود و مختصات' },
  { title: 'اسناد و مدارک', short: 'مدارک', icon: 'document', note: 'مالکیت، نقشه و گواهی مختصات' },
  { title: 'پرداخت خدمات', short: 'پرداخت', icon: 'payment', note: 'ثبت آزمایشی پرداخت در POC' },
  { title: 'گردش کارشناسی', short: 'کارشناسی', icon: 'work', note: 'نقشه‌برداری، حقوقی و ثبتی' },
  { title: 'ارسال، رفع نقص و نتیجه', short: 'نتیجه', icon: 'check', note: 'سازمان ثبت و پیگیری متقاضی' },
];

function setActiveNav(view) {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
}

function showToast(message, detail = '') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<b>${message}</b>${detail ? `<small>${detail}</small>` : ''}`;
  toastRegion.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function shellHead(title, subtitle, actions = '') {
  return `<header class="page-head">
    <div><span class="crumb">کاتب / سامانه ثبت و کارشناسی اسناد املاک</span><h1>${title}</h1><p>${subtitle}</p></div>
    <div class="page-actions">${actions}</div>
  </header>`;
}

function focusItem(number, title, copy, action) {
  return `<button class="focus-item" data-action="${action}"><span class="num">${number}</span><span><b>${title}</b><small>${copy}</small></span><span class="chev" data-icon="chevron"></span></button>`;
}

function relatedOrbs(items, title = 'سرویس‌های مرتبط', placement = 'inline') {
  return `<nav class="related-orb-wrap ${placement === 'side' ? 'side-related' : ''}" aria-label="${title}"><span class="related-label">${title}</span><div class="related-orb-line">${items.map(({icon,label,copy,action,step})=>`<button class="related-orb" data-action="${action}" ${step !== undefined ? `data-step="${step}"` : ''}><span data-icon="${icon}"></span><b>${label}</b><small>${copy}</small></button>`).join('')}</div></nav>`;
}

function renderHome() {
  state.view = 'home';
  setActiveNav('home');
  main.innerHTML = `<section class="page-enter">
    <header class="category-head">
      <div><span class="crumb">کاتب / دسته‌بندی خدمات</span><h1>خدمات املاک و کاداستر</h1><p>برای شروع، خدمت مورد نظر را انتخاب یا جست‌وجو کنید.</p></div>
      <label class="category-search"><span data-icon="search"></span><input aria-label="جست‌وجو در خدمات ملکی" placeholder="جست‌وجو در خدمات ملکی…"></label>
    </header>
    <div class="crystal-stage">
      <div class="orbit-ring" aria-hidden="true"></div>
      <div class="crystal-orb hero">
        <div class="hero-content">
          <div class="hero-title"><span class="orb-icon" data-icon="property"></span><h1>پرونده و خدمات ملکی</h1><p>سه مسیر اصلی برای شروع سریع</p></div>
          <div class="hero-status">یکی از مسیرهای اصلی را انتخاب کنید</div>
          <div class="focus-list">
            ${focusItem('۱','ثبت و کارشناسی اسناد املاک','تشکیل پرونده مطابق شرح خدمات PDF','new-case')}
            ${focusItem('۲','املاک من','مشاهده، اشتراک‌گذاری و جزئیات ملک','my-properties')}
            ${focusItem('۳','استعلام وضعیت الکترونیک ملک','پیگیری با شناسه الکترونیکی ۱۸ رقمی','property-status')}
          </div>
          <button class="glass-button primary hero-action" data-action="new-case">شروع پرونده کارشناسی</button>
        </div>
      </div>
      <button class="crystal-orb satellite s1" data-action="authenticity"><span class="orb-icon" data-icon="verify"></span><strong>تصدیق اصالت سند</strong><small>شناسه و رمز تصدیق</small><span class="orb-status">اسناد رسمی</span></button>
      <button class="crystal-orb satellite s2" data-action="official-docs"><span class="orb-icon" data-icon="document"></span><strong>اسناد رسمی من</strong><small>اسناد ثبت‌شده کاربر</small><span class="orb-status">از ۱۳۹۲ به بعد</span></button>
      <button class="crystal-orb satellite s3" data-action="document-cost"><span class="orb-icon" data-icon="calculator"></span><strong>محاسبه هزینه سند</strong><small>برآورد هزینه ثبت</small><span class="orb-status">سرویس کاتب</span></button>
      <button class="crystal-orb satellite s4" data-action="my-properties"><span class="orb-icon" data-icon="share"></span><strong>اشتراک‌گذاری ملک</strong><small>دسترسی کنترل‌شده</small><span class="orb-status">املاک من</span></button>
      <button class="crystal-orb satellite s5" data-action="property-status"><span class="orb-icon" data-icon="search"></span><strong>وضعیت الکترونیک</strong><small>پیگیری شناسه ملک</small><span class="orb-status">استعلام</span></button>
      <button class="crystal-orb satellite s6" data-action="tracking"><span class="orb-icon" data-icon="tracking"></span><strong>پیگیری پرونده</strong><small>کارشناسی و رفع نقص</small><span class="orb-status">پرونده فعال</span></button>
    </div>
    <div class="assistant-zone"><div class="assistant-dock glass"><button data-action="assistant"><span data-icon="sparkle"></span></button><span>راهنمای هوشمند کاتب؛ سؤال خود را بپرسید…</span><button data-action="assistant"><span data-icon="search"></span></button></div>
      <div class="assistant-hints"><button data-action="assistant">مدارک لازم چیست؟</button><button data-action="assistant">پرونده چگونه کارشناسی می‌شود؟</button><button data-action="tracking">رفع نقص چگونه انجام می‌شود؟</button></div>
    </div>
  </section>`;
}

function pips() {
  return `<div class="step-pips">${stages.map((_, i) => `<button class="${i < state.step ? 'done' : ''} ${i === state.step ? 'active' : ''}" data-action="go-step" data-step="${i}" aria-label="مرحله ${i+1}"></button>`).join('')}</div>`;
}

function stepContent(step) {
  if (step === 0) return `<span class="orb-icon" data-icon="sparkle"></span><h2>نوع درخواست</h2><p>خدمت اصلی نسخه قابل ارزیابی</p>
    <div class="inline-alert blue"><span data-icon="check"></span><span><b>ورود کاربر تأیید شده است.</b><br>نشست سارا احمدی با نقش مالک فعال است؛ ثبت‌نام و ورود در نسخه عملیاتی به درگاه هویت متصل می‌شود.</span></div>
    <div class="choice-row"><button class="choice-chip selected">ثبت و کارشناسی ملک</button><button class="choice-chip">تکمیل پرونده ناقص</button></div>
    <div class="form-grid" style="margin-top:13px"><div class="field"><label>نوع متقاضی</label><select><option>شخص حقیقی</option><option>شخص حقوقی</option></select></div><div class="field"><label>نوع ملک</label><select><option>مسکونی</option><option>تجاری</option><option>زمین</option></select></div><div class="field full"><label>مسیر ارجاع نمایندگی</label><select><option>انتخاب خودکار بر اساس محل وقوع ملک</option><option>انتخاب دستی نمایندگی</option></select></div></div>
    <p class="step-note">این POC مسیر عمومی شرح خدمات را نمایش می‌دهد؛ نوع حقوقی نهایی پس از تحلیل تفصیلی مشخص می‌شود.</p>`;
  if (step === 1) return `<span class="orb-icon" data-icon="verify"></span><h2>احراز هویت اولیه</h2><p>انتقال کنترل‌شده به سرویس بیرونی</p>
    <div class="kyc-provider"><span class="seal">ک</span><span><b>درگاه احراز هویت همکار</b><small>تطبیق کد ملی، مالکیت شماره همراه و کنترل حیات</small></span><button class="glass-button" data-action="kyc">${state.kyc ? 'مشاهده نتیجه' : 'شروع'}</button></div>
    ${state.kyc ? '<div class="success-banner" style="margin-top:13px"><b>هویت آزمایشی با موفقیت تطبیق یافت</b><p>شناسه نتیجه KYC-784210 در سابقه پرونده ذخیره شد.</p></div>' : '<div class="inline-alert" style="margin-top:13px"><span data-icon="info"></span><span>کاربر برای احراز هویت از سامانه خارج می‌شود و فقط نتیجه امضاشده سرویس همکار به پرونده بازمی‌گردد.</span></div>'}`;
  if (step === 2) return `<span class="orb-icon" data-icon="user"></span><h2>مشخصات متقاضی</h2><p>نمونه اطلاعات برای ارزیابی گردش کار</p>
    <div class="form-grid"><div class="field"><label>نام و نام خانوادگی</label><input value="سارا احمدی"></div><div class="field"><label>کد ملی تأییدشده</label><input value="۰۰۱۲۳۴۵۶۷۸" class="ltr" readonly></div><div class="field"><label>شماره همراه</label><input value="۰۹۱۲۱۲۳۴۵۶۷" class="ltr"></div><div class="field"><label>سمت در پرونده</label><select><option>مالک</option><option>نماینده قانونی</option><option>وکیل</option></select></div><div class="field"><label>نوع مالکیت</label><select><option>شش‌دانگ</option><option>مشاعی</option></select></div><div class="field"><label>شیوه دریافت اعلان</label><select><option>پیامک و اعلان سامانه</option><option>فقط اعلان سامانه</option></select></div><div class="field full"><label>نشانی</label><input value="تهران، خیابان میرداماد، پلاک ۱۲"></div></div>`;
  if (step === 3) return `<span class="orb-icon" data-icon="pin"></span><h2>موقعیت و مشخصات ملک</h2><p>اطلاعات ثبتی و نقطه روی نقشه</p><div class="mini-map" data-action="move-pin"></div>
    <div class="form-grid" style="margin-top:11px"><div class="field"><label>واحد ثبتی</label><input value="تهران مرکزی"></div><div class="field"><label>حوزه ثبتی</label><input value="ناحیه ۳"></div><div class="field"><label>پلاک اصلی</label><input value="۱۲۳۴"></div><div class="field"><label>پلاک فرعی</label><input value="۵۶"></div><div class="field"><label>مساحت طبق نقشه</label><input value="۲۴۸ مترمربع"></div><div class="field"><label>نوع کاربری</label><select><option>مسکونی</option><option>تجاری</option><option>اداری</option></select></div><div class="field full"><label>مختصات مرکزی آزمایشی</label><input value="35.7514, 51.4226" class="ltr"></div></div>`;
  if (step === 4) return `<span class="orb-icon" data-icon="document"></span><h2>اسناد و مدارک</h2><p>تشکیل پرونده الکترونیکی</p><div class="upload-list">
    ${uploadRow('هویتی','تصویر مدرک هویتی و نمایندگی')}${uploadRow('مالکیت','مبایعه‌نامه، بنچاق یا سند موجود')}${uploadRow('نقشه','نقشه UTM ممهور به مهر کارشناس')}${uploadRow('مختصات','گواهی تعیین مختصات و حدود اربعه')}
    </div>`;
  if (step === 5) return `<span class="orb-icon" data-icon="payment"></span><h2>پرداخت آزمایشی</h2><p>مبلغ‌ها در شرح خدمات نهایی نشده‌اند</p><div class="cost-lines"><div class="cost-line"><span>تشکیل و بررسی پرونده</span><b>محاسبه در مرحله اجرا</b></div><div class="cost-line"><span>خدمات کارشناسی</span><b>پس از ارجاع</b></div><div class="cost-line total"><span>وضعیت POC</span><b>${state.paid ? 'پرداخت آزمایشی موفق' : 'آماده شبیه‌سازی'}</b></div></div><button class="glass-button primary hero-action" data-action="pay">${state.paid ? 'مشاهده رسید' : 'شبیه‌سازی پرداخت'}</button>`;
  if (step === 6) return `<span class="orb-icon" data-icon="work"></span><h2>گردش کارشناسی</h2><p>ارجاع به نمایندگی و سه تخصص مرتبط</p><div class="inline-alert blue"><span data-icon="office"></span><span><b>نمایندگی تهران مرکزی</b><br>ارجاع خودکار بر اساس حوزه ثبتی و ظرفیت روز انجام شده است.</span></div><div class="flow-mini"><span class="done">نمایندگی</span><span class="${state.experts.survey?'done':'current'}">نقشه‌برداری</span><span class="${state.experts.legal?'done':''}">حقوقی</span><span class="${state.experts.registry?'done':''}">ثبتی</span></div><div class="glass-list" style="margin-top:11px">${expertRow('survey','pin','بازدید، نقشه و گزارش حدود')}${expertRow('legal','legal','مالکیت، سمت و استعلام حقوقی')}${expertRow('registry','document','سوابق ثبتی و کنترل نهایی')}</div><h3 class="subsection-title">استعلام‌های تکمیلی پرونده</h3><div class="internal-cards"><div class="internal-card"><span data-icon="search"></span><b>تطبیق مالکیت</b><small>رابط شبیه‌سازی‌شده · پاسخ معتبر</small></div><div class="internal-card"><span data-icon="legal"></span><b>محدودیت حقوقی</b><small>رابط شبیه‌سازی‌شده · بدون مانع</small></div><div class="internal-card"><span data-icon="document"></span><b>سوابق ثبتی</b><small>رابط شبیه‌سازی‌شده · دریافت شد</small></div></div>`;
  return `<span class="orb-icon" data-icon="check"></span><h2>ارسال و نتیجه</h2><p>سازمان ثبت، رفع نقص و اعلام نتیجه</p><div class="flow-mini"><span class="${state.sent?'done':'current'}">آماده‌سازی</span><span class="${state.sent?'done':''}">ارسال</span><span class="${state.defect?'current':state.final?'done':''}">کنترل نقص</span><span class="${state.final?'done':''}">نتیجه</span></div><div class="inline-alert blue" style="margin-top:13px"><span data-icon="info"></span><span>ارسال پرونده، دریافت نتیجه و پیام سازمان ثبت در این POC شبیه‌سازی می‌شود؛ رخداد و شناسه پاسخ در تاریخچه باقی می‌ماند.</span></div>
    <div class="step-actions">${!state.sent ? '<button class="glass-button primary" data-action="send">شبیه‌سازی ارسال</button>' : !state.defect && !state.final ? '<button class="glass-button danger" data-action="defect">اعلام نقص آزمایشی</button><button class="glass-button primary" data-action="final">تأیید نتیجه</button>' : state.defect ? '<button class="glass-button primary" data-action="resolve">اصلاح و ارسال مجدد</button>' : '<button class="glass-button primary" data-action="certificate">مشاهده نتیجه نهایی</button>'}</div><p class="step-note">هر تغییر وضعیت از طریق اعلان داخل سامانه و پیامک آزمایشی به متقاضی اعلام می‌شود.</p>`;
}

function uploadRow(key, label) {
  const done = state.uploads.has(key);
  return `<div class="upload-item ${done ? 'done' : ''}"><span data-icon="${done ? 'check' : 'upload'}"></span><span><b>${key}</b><small>${label}</small></span><button data-action="upload" data-upload="${key}">${done ? 'ثبت شد' : 'افزودن'}</button></div>`;
}

function expertRow(key, icon, label) {
  const done = state.experts[key];
  return `<div class="glass-row"><span class="row-icon" data-icon="${icon}"></span><span><b>${label}</b><small>${done ? 'گزارش آزمایشی ثبت شد' : 'در انتظار اقدام کارشناس'}</small></span><button class="status-pill ${done ? '' : 'blue'}" data-action="expert" data-expert="${key}">${done ? 'تکمیل' : 'ثبت گزارش'}</button></div>`;
}

function readinessPanel() {
  const checks = [
    ['ثبت درخواست و ملک', state.step > 0],['احراز هویت بیرونی', state.kyc],['پرونده الکترونیکی', state.uploads.size >= 3],['پرداخت آزمایشی', state.paid],['نقشه‌برداری', state.experts.survey],['بررسی حقوقی', state.experts.legal],['بررسی ثبتی', state.experts.registry],['ارسال یا رفع نقص', state.sent],
  ];
  const completed = checks.filter(([, done]) => done).length;
  const percent = Math.round((completed / checks.length) * 100);
  const ready = completed === checks.length;
  return `<div class="readiness ${ready ? '' : 'warn'}">
      <div class="readiness-top"><b>${ready ? 'پرونده آماده ارسال است' : 'پرونده هنوز آماده ارسال نیست'}</b><span>${percent}٪</span></div>
      <div class="readiness-bar"><i style="width:${percent}%"></i></div>
    </div>
    <div class="checklist">${checks.map(([label,done],i)=>`<div class="check-row ${done?'done':''}"><span>${done?'✓':i+1}</span><span><b>${label}</b><small>${done?'کنترل این بخش انجام شده است':'نیازمند تکمیل یا تأیید'}</small></span><em>${done?'تکمیل':'باز'}</em></div>`).join('')}</div>`;
}

function renderWizard(step = state.step) {
  state.view = 'new-case'; state.step = Math.max(0, Math.min(7, Number(step))); setActiveNav('new-case');
  const stage = stages[state.step];
  main.innerHTML = `<section class="page-shell page-enter">${shellHead('پرونده جدید', 'مسیر کامل نسخه قابل ارزیابی، مطابق شرح خدمات PDF', '<span class="demo-badge">بخش‌های بیرونی شبیه‌سازی شده‌اند</span>')}
    <div class="flow-layout has-related">
      <nav class="process-stepper" aria-label="مراحل پرونده">${stages.map((item,i)=>`<button class="process-step ${i<state.step?'done':''} ${i===state.step?'active':''}" data-action="go-step" data-step="${i}"><span>${i<state.step?'✓':i+1}</span><b>${item.short}</b></button>`).join('')}</nav>
      <div class="flow-grid">
        <section class="surface form-surface">
          <header class="surface-head"><div class="title-wrap"><span class="step-icon" data-icon="${stage.icon}"></span><div><h2>${stage.title}</h2><p>${stage.note}</p></div></div><span class="step-number">مرحله ${state.step+1} از ۸</span></header>
          <div class="surface-body">${stepContent(state.step)}</div>
          <footer class="surface-actions"><small>تغییرات این پیش‌نویس به‌صورت آزمایشی ذخیره می‌شوند.</small><div>${state.step>0?'<button class="glass-button" data-action="prev">مرحله قبل</button>':''}${state.step<7?'<button class="glass-button primary" data-action="next">ادامه مسیر</button>':'<button class="glass-button" data-action="tracking">پیگیری پرونده</button>'}</div></footer>
        </section>
        <aside class="surface side-surface"><h3>آمادگی پرونده</h3><p>موارد باز را تکمیل کنید. ارسال نهایی فقط پس از تأیید مدارک و کارشناسان ممکن است.</p>${readinessPanel()}</aside>
      </div>
      ${relatedOrbs([
        {icon:'user',label:'ورود و حساب کاربری',copy:'نشست، نقش و احراز اولیه',action:'account'},
        {icon:'verify',label:'احراز هویت',copy:'سرویس بیرونی همکار',action:'go-step',step:1},
        {icon:'document',label:'مدارک پرونده',copy:'بارگذاری و کنترل نسخه',action:'go-step',step:4},
        {icon:'tracking',label:'پیگیری پرونده',copy:'وضعیت و تاریخچه اقدام',action:'tracking'}
      ], 'سرویس‌های مرتبط', 'side')}
    </div></section>`;
}

function renderTracking() {
  state.view = 'tracking'; setActiveNav('tracking');
  const status = state.final ? 'نتیجه نهایی آماده مشاهده است' : state.defect ? 'پرونده برای رفع نقص برگشته است' : state.sent ? 'ارسال آزمایشی به سازمان ثبت انجام شد' : 'پرونده هنوز آماده ارسال نیست';
  main.innerHTML = `<section class="page-shell page-enter">${shellHead('پیگیری پرونده', 'شناسه KT-1405-08421 · ملک مسکونی · تهران', '<button class="glass-button" data-action="new-case">باز کردن پرونده</button>')}<div class="content-with-related">
    <div class="flow-grid">
      <section class="surface form-surface"><header class="surface-head"><div class="title-wrap"><span class="step-icon" data-icon="tracking"></span><div><h2>${status}</h2><p>آخرین به‌روزرسانی آزمایشی: امروز، ۱۲:۴۰</p></div></div><span class="step-number">KT-1405-08421</span></header><div class="timeline">${timelineHtml()}</div></section>
      <aside class="surface side-surface"><h3>وضعیت لحظه‌ای پرونده</h3><p>تمام اقدام‌ها، ارجاع‌ها و پاسخ سرویس‌های بیرونی در تاریخچه پرونده ثبت می‌شوند.</p>${readinessPanel()}</aside>
    </div>${relatedOrbs([{icon:'sparkle',label:'پرونده',copy:'مشاهده و تکمیل اطلاعات',action:'new-case'},{icon:'work',label:'گردش کارشناسی',copy:'سه بررسی تخصصی',action:'expert'},{icon:'search',label:'وضعیت ملک',copy:'شناسه الکترونیکی ملک',action:'property-status'}],'سرویس‌های مرتبط','side')}</div></section>`;
}

function timelineHtml() {
  const items = [
    ['ثبت درخواست','اطلاعات متقاضی و ملک ثبت شد',true],['تشکیل پرونده','مدارک و پرداخت آزمایشی',state.paid],['ارجاع به نمایندگی','انتخاب بر اساس محل وقوع ملک',state.step>=6],['گردش کارشناسی','نقشه‌برداری، حقوقی و ثبتی',Object.values(state.experts).every(Boolean)],['ارسال به سازمان ثبت','رابط آزمایشی ارسال پرونده',state.sent],['نتیجه یا رفع نقص',state.defect?'نقص مدرک نقشه ثبت شده':state.final?'نتیجه مثبت ثبت شد':'در انتظار پاسخ',state.final||state.defect],
  ];
  return items.map(([title,copy,done],i)=>`<div class="timeline-item ${done?'done':i===items.findIndex(x=>!x[2])?'current':''}"><span class="timeline-mark">${done?'✓':i+1}</span><span class="timeline-copy"><b>${title}</b><p>${copy}</p></span><span class="timeline-time">${done?'ثبت شد':'—'}</span></div>`).join('');
}

function renderExpert() {
  state.view = 'expert'; setActiveNav('expert');
  main.innerHTML = `<section class="page-shell page-enter">${shellHead('میز کار کارشناسی', 'پرونده آزمایشی ارجاع‌شده به نمایندگی تهران مرکزی', '<button class="glass-button" data-action="tracking">مشاهده تاریخچه</button>')}<div class="content-with-related">
  <div class="flow-grid">
    <section class="surface form-surface"><header class="surface-head"><div class="title-wrap"><span class="step-icon" data-icon="work"></span><div><h2>پرونده KT-1405-08421</h2><p>سه بررسی تخصصی برای تکمیل پرونده</p></div></div><button class="glass-button primary" data-action="finish-experts">تکمیل آزمایشی هر سه</button></header>
      <div class="role-grid">${roleCard('survey','pin','نقشه‌برداری و بازدید','کنترل موقعیت، حدود، مساحت و ثبت گزارش بازدید میدانی')}${roleCard('legal','legal','کارشناسی حقوقی','بررسی زنجیره مالکیت، سمت متقاضی و تعارض‌های حقوقی')}${roleCard('registry','document','کارشناسی ثبتی','کنترل پلاک، سوابق ثبتی و آمادگی ارسال به سازمان ثبت')}</div>
      <div class="inline-alert blue" style="margin-top:14px"><span data-icon="info"></span><span>دسترسی هر کارشناس بر اساس نقش محدود می‌شود و همه اقدامات در سابقه پرونده قابل ردگیری است.</span></div>
    </section>
    <aside class="surface side-surface"><h3>اطلاعات مبنای بررسی</h3><p>این داده‌ها پیش از شروع کارشناسی از پرونده متقاضی خوانده شده‌اند.</p><div class="checklist"><div class="check-row done"><span>✓</span><span><b>پلاک و مختصات</b><small>۱۲۳۴/۵۶ · ۲۴۸ مترمربع</small></span><em>کامل</em></div><div class="check-row done"><span>✓</span><span><b>مستندات مالکیت</b><small>۴ فایل با سابقه نسخه</small></span><em>کامل</em></div><div class="check-row"><span>۳</span><span><b>استعلام تکمیلی</b><small>رابط نمایشی POC</small></span><em>آزمایشی</em></div></div></aside>
  </div>${relatedOrbs([{icon:'document',label:'مدارک پرونده',copy:'نسخه‌ها و مستندات',action:'go-step',step:4},{icon:'tracking',label:'پیگیری',copy:'تاریخچه پرونده',action:'tracking'},{icon:'dashboard',label:'مدیریت مرکزی',copy:'ظرفیت و گزارش‌ها',action:'admin'}],'سرویس‌های مرتبط','side')}</div></section>`;
}

function roleCard(key, icon, title, copy) {
  const done = state.experts[key];
  return `<article class="role-card"><div class="role-card-head"><span data-icon="${icon}"></span><span class="status-pill ${done?'':'blue'}">${done?'تکمیل':'در انتظار'}</span></div><h3>${title}</h3><p>${copy}</p><button class="glass-button ${done?'':'primary'}" data-action="expert" data-expert="${key}">${done?'مشاهده گزارش':'ثبت گزارش آزمایشی'}</button></article>`;
}

function renderAdmin() {
  state.view = 'admin'; setActiveNav('admin');
  main.innerHTML = `<section class="page-shell page-enter">${shellHead('مدیریت مرکزی', 'نمایش آزمایشی شبکه نمایندگی‌ها، پرونده‌ها و ظرفیت کارشناسی', '<span class="demo-badge">داده نمایشی</span>')}
    <div class="content-with-related"><div><div class="kpi-flat-grid"><div class="surface kpi-flat"><small>پرونده فعال</small><b>۱۲۸</b><em>۱۲ مورد جدید امروز</em></div><div class="surface kpi-flat"><small>آماده ارسال</small><b>۲۱</b><em>تأیید هر سه تخصص</em></div><div class="surface kpi-flat"><small>در رفع نقص</small><b>۷</b><em>نیازمند اقدام متقاضی</em></div><div class="surface kpi-flat"><small>در مهلت پاسخ</small><b>۹۴٪</b><em>وضعیت پایدار شبکه</em></div></div>
    <div class="admin-grid"><section class="surface table-surface"><header class="surface-head"><div class="title-wrap"><span class="step-icon" data-icon="dashboard"></span><div><h2>شبکه نمایندگی‌ها</h2><p>ظرفیت روز و حجم پرونده‌های فعال</p></div></div><span class="step-number">امروز</span></header><table class="operational-table"><thead><tr><th>نمایندگی</th><th>پرونده فعال</th><th>ظرفیت امروز</th><th>وضعیت</th></tr></thead><tbody><tr><td>تهران مرکزی</td><td>۳۸</td><td><div class="capacity"><i style="width:84%"></i></div></td><td><span class="status-pill red">پرتراکم</span></td></tr><tr><td>کرج</td><td>۲۱</td><td><div class="capacity"><i style="width:62%"></i></div></td><td><span class="status-pill">عادی</span></td></tr><tr><td>اصفهان</td><td>۱۷</td><td><div class="capacity"><i style="width:53%"></i></div></td><td><span class="status-pill">عادی</span></td></tr></tbody></table></section>
    <aside class="surface admin-side"><h3>نیازمند توجه</h3><p>پرونده‌های نزدیک به مهلت پاسخ در اولویت پیگیری هستند.</p><div class="status-rail"><button class="check-row" data-action="tracking"><span>۷</span><span><b>پرونده متوقف</b><small>نقص مدرک یا انتظار کارشناس</small></span><em>بررسی</em></button><button class="check-row" data-action="expert"><span>۲۱</span><span><b>آماده ارسال</b><small>تأیید تخصص‌ها تکمیل است</small></span><em>مشاهده</em></button><div class="check-row done"><span data-icon="check"></span><span><b>گزارش نمایندگی‌ها</b><small>ظرفیت، مهلت پاسخ و عملکرد</small></span><em>فعال</em></div><div class="check-row done"><span data-icon="check"></span><span><b>ثبت رخداد امنیتی</b><small>نقش، اقدام و زمان دسترسی</small></span><em>فعال</em></div></div></aside></div></div>${relatedOrbs([{icon:'work',label:'میز کارشناسی',copy:'پرونده‌های ارجاعی',action:'expert'},{icon:'tracking',label:'پیگیری مرکزی',copy:'رخداد و رفع نقص',action:'tracking'},{icon:'sparkle',label:'تشکیل پرونده',copy:'مسیر متقاضی',action:'new-case'}],'سرویس‌های مرتبط','side')}</div></section>`;
}

function renderKatebService(type) {
  state.view = 'home'; setActiveNav('home');
  const configs = {
    authenticity: {
      title: 'تصدیق اصالت سند', icon: 'verify', subtitle: 'استعلام اصالت اسناد رسمی با شناسه سند و رمز تصدیق',
      body: `<div class="form-grid"><div class="field full"><label>شناسه سند</label><input placeholder="شناسه سند را وارد کنید" class="ltr"></div><div class="field full"><label>رمز تصدیق</label><input placeholder="رمز تصدیق را وارد کنید" class="ltr"></div></div><p class="step-note">مطابق راهنمای کاتب، اسناد ثبت‌شده از سال ۱۳۹۳ به بعد در سامانه قابل بررسی هستند.</p><button class="glass-button primary hero-action" data-action="mock-check">بررسی آزمایشی</button>`,
      note: 'ورودی‌های مرجع کاتب', extra: 'شناسه سند · رمز تصدیق'
    },
    properties: {
      title: 'املاک من', icon: 'property', subtitle: 'دفتر الکترونیکی املاک و دسترسی‌های اشتراکی',
      body: `<div class="choice-row"><button class="choice-chip selected">املاک من</button><button class="choice-chip">اشتراک‌گذاری</button><button class="choice-chip">املاک دیگران</button></div><div class="glass-list" style="margin-top:13px"><div class="glass-row"><span class="row-icon" data-icon="property"></span><span><b>ملک مسکونی · کرج ناحیه ۳</b><small>پلاک اصلی ۱۷۰ · پلاک فرعی ۵۴۸۶۹</small></span><button class="status-pill" data-action="property-detail">جزئیات ملک</button></div></div>`,
      note: 'ساختار دیده‌شده در کاتب', extra: 'مشاهده · اشتراک · دریافت سند'
    },
    status: {
      title: 'استعلام وضعیت الکترونیک ملک', icon: 'search', subtitle: 'پیگیری وضعیت با شناسه الکترونیکی ملک',
      body: `<div class="form-grid"><div class="field full"><label>شناسه الکترونیکی ۱۸ رقمی ملک</label><input placeholder="شناسه را وارد کنید" class="ltr"></div></div><p class="step-note">نتیجه در نسخه POC شبیه‌سازی می‌شود و به سامانه واقعی سازمان ثبت متصل نیست.</p><button class="glass-button primary hero-action" data-action="mock-check">استعلام آزمایشی</button>`,
      note: 'ورودی سرویس ملکی کاتب', extra: 'شناسه الکترونیکی ۱۸ رقمی'
    },
    docs: {
      title: 'اسناد رسمی من', icon: 'document', subtitle: 'نمایش اسناد رسمی ثبت‌شده برای کاربر',
      body: `<div class="glass-list"><div class="glass-row"><span class="row-icon" data-icon="document"></span><span><b>سند قطعی غیرمنقول</b><small>دفترخانه نمونه · تاریخ ثبت ۱۴۰۴/۰۸/۱۲</small></span><span class="status-pill">معتبر</span></div><div class="glass-row"><span class="row-icon" data-icon="document"></span><span><b>وکالت‌نامه ملکی</b><small>دفترخانه نمونه · تاریخ ثبت ۱۴۰۳/۱۱/۰۷</small></span><span class="status-pill">فعال</span></div></div>`,
      note: 'نمونه نمایشی', extra: 'اسناد ثبت‌شده کاربر'
    },
    cost: {
      title: 'محاسبه هزینه سند', icon: 'calculator', subtitle: 'برآورد هزینه سند در فرایند رسمی',
      body: `<div class="form-grid"><div class="field"><label>نوع سند</label><select><option>قطعی غیرمنقول</option><option>رهنی</option><option>وکالت‌نامه</option></select></div><div class="field"><label>ارزش معاملاتی</label><input placeholder="مبلغ به ریال" class="ltr"></div></div><p class="step-note">مبالغ عمداً در شرح خدمات PDF حذف شده‌اند؛ در POC فقط مسیر محاسبه نمایش داده می‌شود.</p><button class="glass-button primary hero-action" data-action="mock-check">محاسبه آزمایشی</button>`,
      note: 'بدون مبلغ واقعی', extra: 'نوع سند · ارزش معاملاتی'
    },
  };
  const c = configs[type];
  main.innerHTML = `<section class="page-shell page-enter">${shellHead(c.title, c.subtitle, '<button class="glass-button" data-action="home">بازگشت به خدمات</button>')}
    <div class="service-panel-grid">
      <section class="surface service-main"><header class="surface-head"><div class="title-wrap"><span class="step-icon" data-icon="${c.icon}"></span><div><h2>${c.title}</h2><p>${c.subtitle}</p></div></div><span class="step-number">سرویس ملکی</span></header><div class="surface-body">${c.body}</div></section>
      <aside class="related-panel">${relatedOrbs([{icon:'verify',label:'اصالت سند',copy:'شناسه و رمز تصدیق',action:'authenticity'},{icon:'property',label:'املاک من',copy:'مشاهده و اشتراک',action:'my-properties'},{icon:'search',label:'وضعیت ملک',copy:'شناسه ۱۸ رقمی',action:'property-status'},{icon:'document',label:'اسناد رسمی من',copy:'سوابق ثبت‌شده',action:'official-docs'}],'مرتبط با این صفحه')}</aside>
    </div></section>`;
}

function openKyc() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>احراز هویت برون‌سامانه‌ای</h2><p>شبیه‌سازی رابط سرویس همکار؛ هیچ داده‌ای ارسال نمی‌شود.</p></div><button class="close-button" data-action="close-modal">×</button></div><div class="provider-view"><span class="demo-badge">محیط آزمایشی</span><div class="face-scan"><span data-icon="verify"></span></div><b>تطبیق چهره و هویت</b><p>در نسخه عملیاتی، کاربر به سرویس مجاز منتقل و تنها نتیجه تأیید به پرونده بازگردانده می‌شود.</p><div class="modal-actions"><button class="glass-button" data-action="close-modal">انصراف</button><button class="glass-button primary" data-action="verify-kyc">شبیه‌سازی تأیید</button></div></div></div></div>`;
}

function openAssistant() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>راهنمای مسیر پرونده</h2><p>پاسخ‌های نمایشی بر اساس شرح خدمات نسخه قابل ارزیابی</p></div><button class="close-button" data-action="close-modal">×</button></div><div class="glass-list"><div class="glass-row"><span class="row-icon" data-icon="document"></span><span><b>مدارک پایه</b><small>هویتی، مستند مالکیت، نقشه و گواهی مختصات</small></span></div><div class="glass-row"><span class="row-icon" data-icon="work"></span><span><b>گردش بررسی</b><small>نمایندگی، نقشه‌بردار، حقوقی و کارشناس ثبتی</small></span></div><div class="glass-row"><span class="row-icon" data-icon="check"></span><span><b>پاسخ نهایی</b><small>ارسال، اعلام نقص، اصلاح و پیگیری نتیجه</small></span></div></div></div></div>`;
}

function openAccount() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>ورود و حساب کاربری</h2><p>بخش پایه شروع فرایند مطابق شرح خدمات</p></div><button class="close-button" data-action="close-modal">×</button></div><div class="checklist"><div class="check-row done"><span>✓</span><span><b>ورود با شماره همراه</b><small>نشست آزمایشی سارا احمدی فعال است</small></span><em>فعال</em></div><div class="check-row done"><span>✓</span><span><b>انتخاب نقش پرونده</b><small>مالک، وکیل یا نماینده قانونی</small></span><em>ثبت شد</em></div><div class="check-row"><span>۳</span><span><b>احراز هویت بیرونی</b><small>تطبیق هویت در درگاه همکار</small></span><em>مرحله بعد</em></div></div><div class="modal-actions"><button class="glass-button" data-action="close-modal">بستن</button><button class="glass-button primary" data-action="go-step" data-step="1">رفتن به احراز هویت</button></div></div></div>`;
}

function openCertificate() {
  modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>نتیجه آزمایشی پرونده</h2><p>شناسه KT-1405-08421</p></div><button class="close-button" data-action="close-modal">×</button></div><div class="provider-view"><div class="face-scan"><span data-icon="check"></span></div><b>پرونده تکمیل و نتیجه ثبت شد</b><p>این خروجی صرفاً برای ارزیابی گردش کار است و اعتبار ثبتی یا حقوقی ندارد.</p><div class="modal-actions"><button class="glass-button primary" data-action="close-modal">متوجه شدم</button></div></div></div></div>`;
}

document.addEventListener('click', (event) => {
  const choice = event.target.closest('.choice-chip');
  if (choice) {
    choice.closest('.choice-row').querySelectorAll('.choice-chip').forEach((chip) => {
      const selected = chip === choice;
      chip.classList.toggle('selected', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    return;
  }
  const nav = event.target.closest('.nav-item');
  if (nav) {
    const view = nav.dataset.view;
    if (view === 'home') renderHome();
    if (view === 'new-case') renderWizard(0);
    if (view === 'tracking') renderTracking();
    if (view === 'expert') renderExpert();
    if (view === 'admin') renderAdmin();
    return;
  }
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;
  const action = trigger.dataset.action;
  if (action === 'new-case') renderWizard(state.step);
  if (action === 'go-step') { modalRoot.innerHTML = ''; renderWizard(trigger.dataset.step); }
  if (action === 'next') renderWizard(state.step + 1);
  if (action === 'prev') renderWizard(state.step - 1);
  if (action === 'kyc') openKyc();
  if (action === 'go-map') renderWizard(3);
  if (action === 'go-docs') renderWizard(4);
  if (action === 'verify-kyc') { state.kyc = true; modalRoot.innerHTML = ''; showToast('احراز هویت آزمایشی تأیید شد','نتیجه سرویس همکار به پرونده بازگشت'); renderWizard(1); }
  if (action === 'close-modal') modalRoot.innerHTML = '';
  if (action === 'upload') { state.uploads.add(trigger.dataset.upload); showToast('مدرک به پرونده افزوده شد', trigger.dataset.upload); renderWizard(4); }
  if (action === 'pay') { state.paid = true; showToast('پرداخت آزمایشی موفق بود','شماره پیگیری POC-784210'); renderWizard(5); }
  if (action === 'expert' && trigger.dataset.expert) { state.experts[trigger.dataset.expert] = true; showToast('گزارش کارشناسی ثبت شد'); state.view === 'expert' ? renderExpert() : renderWizard(6); }
  if (action === 'expert' && !trigger.dataset.expert) renderExpert();
  if (action === 'admin') renderAdmin();
  if (action === 'finish-experts') { state.experts = {survey:true,legal:true,registry:true}; showToast('هر سه بررسی تخصصی تکمیل شد'); renderExpert(); }
  if (action === 'send') { state.sent = true; showToast('ارسال آزمایشی انجام شد','پرونده برای دریافت نتیجه آماده است'); renderWizard(7); }
  if (action === 'defect') { state.defect = true; showToast('نقص آزمایشی ثبت شد','نسخه نقشه نیازمند اصلاح است'); renderWizard(7); }
  if (action === 'resolve') { state.defect = false; showToast('نقص اصلاح و پرونده مجدداً ارسال شد'); renderWizard(7); }
  if (action === 'final') { state.final = true; showToast('نتیجه نهایی آزمایشی ثبت شد'); renderWizard(7); }
  if (action === 'certificate') openCertificate();
  if (action === 'tracking') renderTracking();
  if (action === 'assistant') openAssistant();
  if (action === 'account') openAccount();
  if (action === 'move-pin') showToast('موقعیت آزمایشی ثبت شد','مختصات نقطه مرکزی به پرونده افزوده شد');
  if (action === 'home') renderHome();
  if (action === 'authenticity') renderKatebService('authenticity');
  if (action === 'my-properties' || action === 'property-detail') renderKatebService('properties');
  if (action === 'property-status') renderKatebService('status');
  if (action === 'official-docs') renderKatebService('docs');
  if (action === 'document-cost') renderKatebService('cost');
  if (action === 'mock-check') showToast('نتیجه آزمایشی آماده شد','این پاسخ به سرویس واقعی متصل نیست');
});

document.querySelector('#notificationButton').addEventListener('click', () => showToast('۲ اعلان آزمایشی','تکمیل مدرک نقشه و پاسخ کارشناس'));

function registerWebMcp() {
  if (!navigator.modelContext?.registerTool) return;
  navigator.modelContext.registerTool({
    name: 'open_property_case_flow',
    description: 'Open a specific step of the property registration and expert review proof of concept.',
    inputSchema: { type: 'object', properties: { step: { type: 'integer', minimum: 1, maximum: 8 } }, required: ['step'] },
    execute: ({ step }) => { renderWizard(step - 1); return { content: [{ type: 'text', text: `Opened step ${step}` }] }; },
  });
}

const initialView = new URLSearchParams(window.location.search).get('view');
const initialStep = Number(new URLSearchParams(window.location.search).get('step') || 0);
if (initialView === 'new-case') renderWizard(initialStep);
else if (initialView === 'tracking') renderTracking();
else if (initialView === 'expert') renderExpert();
else if (initialView === 'admin') renderAdmin();
else if (['authenticity','properties','status','docs','cost'].includes(initialView)) renderKatebService(initialView);
else renderHome();
registerWebMcp();
hydrateIcons();

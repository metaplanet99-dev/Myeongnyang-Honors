const app = document.querySelector("#app");

const state = {
  route: "landing",
  loginIntent: "signup",
  loggedIn: false,
  signup: {
    name: "",
    phone: "",
    grade: "",
    interests: [],
    agreed: false,
  },
  reservation: {
    date: "",
    time: "",
    guests: 0,
    memo: "",
  },
  member: {
    name: "홍길동",
    phone: "010-4245-5871",
    grade: "VVIP",
    expiresAt: "2026년 12월 31일",
    interests: ["무용", "노래"],
  },
  applications: [
    { id: 1, name: "김민서", phone: "010-3201-4412", grade: "VIP", interests: "노래", status: "대기" },
    { id: 2, name: "박지훈", phone: "010-7712-9081", grade: "VVIP", interests: "악기", status: "대기" },
    { id: 3, name: "이서연", phone: "010-8422-1004", grade: "VIP", interests: "무용", status: "대기" },
  ],
  members: [
    { id: 1, name: "홍길동", grade: "VVIP", phone: "010-4245-5871", paid: true, expiresAt: "2026-12-31" },
    { id: 2, name: "정하늘", grade: "VIP", phone: "010-2401-1188", paid: true, expiresAt: "2026-10-31" },
    { id: 3, name: "문소리", grade: "VIP", phone: "010-9981-5512", paid: false, expiresAt: "2026-08-31" },
  ],
  bookings: [
    { id: 1, member: "홍길동", date: "2026-09-20", time: "오후 6:00 ~ 오후 9:00", guests: 2, status: "확정" },
    { id: 2, member: "정하늘", date: "2026-09-22", time: "오후 7:00 ~ 오후 10:00", guests: 0, status: "신청" },
    { id: 3, member: "문소리", date: "2026-08-15", time: "오후 6:00 ~ 오후 9:00", guests: 1, status: "완료" },
  ],
  adminForm: {
    name: "",
    phone: "",
    grade: "VIP",
    expiresAt: "2026-12-31",
  },
};

window.state = state;

// small은 휴대폰용(800px), src는 PC용(1280px).
// 폰에서 큰 사진을 받아 펼치면 메모리를 많이 써서 브라우저가 이미지를 버리는 일이 생긴다.
const spaceImages = [
  { src: "uploads/space-1.jpg", small: "uploads/space-1-800.jpg", alt: "명량아너스클럽 실내 공간 사진 1" },
  { src: "uploads/space-2.jpg", small: "uploads/space-2-800.jpg", alt: "명량아너스클럽 실내 공간 사진 2" },
  { src: "uploads/space-3.jpg", small: "uploads/space-3-800.jpg", alt: "명량아너스클럽 실내 공간 사진 3" },
  { src: "uploads/space-4.jpg", small: "uploads/space-4-800.jpg", alt: "명량아너스클럽 실내 공간 사진 4" },
];

const venue = {
  name: "명량아너스클럽",
  address: "서울특별시 강서구 개화동로27가길 33 (방화동) 지하 2층",
  searchQuery: "서울특별시 강서구 개화동로27가길 33",
  hours: "오후 6:00 ~ 오후 10:00 · 1회 3시간 단위",
  contacts: [
    { role: "사무국장", name: "김지현", phone: "010-4245-5871" },
    { role: "사무총장", name: "윤형관", phone: "010-5495-6465" },
  ],
};

const routes = {
  member: [
    ["home", "홈"],
    ["reservation", "예약하기"],
    ["reservations", "예약내역"],
    ["myinfo", "마이페이지"],
  ],
  admin: [
    ["admin", "관리자 홈"],
    ["admin-approvals", "가입 승인"],
    ["admin-register", "대신 등록"],
    ["admin-fees", "회비 관리"],
    ["admin-bookings", "예약 현황"],
    ["admin-settlement", "게스트 정산"],
  ],
};

const memberRoutes = ["home", "reservations", "myinfo"];

function setRoute(route) {
  if (memberRoutes.includes(route)) state.loggedIn = true;
  state.route = route;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setLoginIntent(intent) {
  state.loginIntent = intent;
  setRoute("login");
}

function update(path, value) {
  const keys = path.split(".");
  let cursor = state;
  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  render();
}

function toggleInterest(interest) {
  const interests = state.signup.interests;
  state.signup.interests = interests.includes(interest)
    ? interests.filter((item) => item !== interest)
    : [...interests, interest];
  render();
}

function submitSignup() {
  const { name, phone, grade, agreed } = state.signup;
  if (!name.trim() || !phone.trim() || !grade || !agreed) {
    alert("필수 항목을 모두 입력해 주세요.");
    return;
  }
  state.member.name = name.trim();
  state.member.phone = phone.trim();
  state.member.grade = grade;
  state.member.interests = state.signup.interests.length ? state.signup.interests : ["미지정"];
  setRoute("waiting");
}

function submitReservation() {
  if (!state.reservation.date || !state.reservation.time) {
    alert("날짜와 시간을 선택해 주세요.");
    return;
  }
  state.bookings.unshift({
    id: Date.now(),
    member: state.member.name,
    date: state.reservation.date,
    time: state.reservation.time,
    guests: state.reservation.guests,
    status: "신청",
  });
  setRoute("confirm");
}

function approveApplication(id) {
  const application = state.applications.find((item) => item.id === id);
  if (!application) return;
  application.status = "승인";
  state.members.push({
    id: Date.now(),
    name: application.name,
    grade: application.grade,
    phone: application.phone,
    paid: false,
    expiresAt: "2026-12-31",
  });
  render();
}

function rejectApplication(id) {
  const application = state.applications.find((item) => item.id === id);
  if (!application) return;
  application.status = "반려";
  render();
}

function addMemberByAdmin() {
  const form = state.adminForm;
  if (!form.name.trim() || !form.phone.trim()) {
    alert("이름과 휴대폰 번호를 입력해 주세요.");
    return;
  }
  state.members.unshift({
    id: Date.now(),
    name: form.name.trim(),
    phone: form.phone.trim(),
    grade: form.grade,
    expiresAt: form.expiresAt,
    paid: false,
  });
  state.adminForm = { name: "", phone: "", grade: "VIP", expiresAt: "2026-12-31" };
  setRoute("admin-fees");
}

function formatDate(dateString) {
  if (!dateString) return "날짜를 선택해 주세요";
  const [year, month, day] = dateString.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function won(value) {
  return `${value.toLocaleString()}원`;
}

function icon(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    money: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
    people: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    clock: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.23a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  };
  return icons[name] || icons.home;
}

function topbar() {
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <button class="brand" onclick="setRoute('landing')">명량아너스클럽</button>
        <div class="top-actions">
          <button class="link-btn" onclick="setRoute('admin')">${icon("shield")}ADMIN</button>
          <button class="link-btn" onclick="setRoute('myinfo')">${icon("user")}마이페이지</button>
          <button class="secondary-btn" onclick="setLoginIntent('signup')">회원가입</button>
          <button class="primary-btn" onclick="setLoginIntent('reservation')">${icon("calendar")}예약하기</button>
        </div>
      </div>
    </header>
  `;
}

function landing() {
  return `
    ${topbar()}
    <main class="landing-page">
      <section class="landing-hero">
        <div class="hero-copy">
          <p class="eyebrow">(재)명량문화재단 공유공간</p>
          <h1>음악과 예술을 위한 프리미엄 회원제 공간</h1>
          <p class="hero-desc">회원 승인부터 예약, 게스트 정산, 회비 관리까지 <br />한 번에 운영할 수 있는 명량아너스클럽 웹앱입니다.</p>
          <div class="hero-actions">
            <button class="secondary-btn hero-cta" onclick="setLoginIntent('signup')">${icon("people")}회원가입하기</button>
            <button class="primary-btn hero-cta" onclick="setLoginIntent('reservation')">${icon("calendar")}예약하기</button>
          </div>
        </div>
      </section>
      <div class="content">
        <section class="section">
          <p class="section-label">SPACE</p>
          <h2>소규모 공연, 모임, 개인 연습을 위한 공유공간</h2>
          <p class="section-desc">프라이빗한 문화예술 공간으로 운영되며, 회원 등급에 따라 이용 범위와 대여 혜택이 달라집니다.</p>
          ${spaceCarousel(spaceImages)}
        </section>
        <section class="section membership-section">
          <div class="section-head centered">
            <div>
              <p class="section-label">MEMBERSHIP</p>
              <h2>회원 등급 안내</h2>
            </div>
            <p>이용 목적과 혜택 범위에 맞춰 VIP 또는 VVIP 등급을 선택할 수 있습니다.</p>
          </div>
          <div class="membership-grid">
            ${gradeCard("VIP", "연회비 300,000원", ["게스트 동반 10명 이내", "음식물 및 음료 반입 가능", "오후 6시부터 10시까지 이용"], false)}
            ${gradeCard("VVIP", "연회비 1,000,000원", ["VIP 모든 혜택 포함", "단체 행사 공간 대여", "교육 프로그램 50% 할인"], true)}
          </div>
        </section>
        <section class="section grid three">
          <div class="card pad">
            <div class="card-icon">${icon("check")}</div>
            <p class="section-label">QUALIFICATION</p>
            <h3>가입 자격</h3>
            <p class="section-desc">운영위원회 승인을 받은 문화예술 회원</p>
          </div>
          <div class="card pad">
            <div class="card-icon">${icon("clock")}</div>
            <p class="section-label">HOURS</p>
            <h3>운영 시간</h3>
            <p class="section-desc">오후 6:00~10:00 운영 · 1회 3시간 단위</p>
          </div>
          <div class="card pad">
            <div class="card-icon">${icon("phone")}</div>
            <p class="section-label">CONTACT</p>
            <h3>이용 문의</h3>
            <p class="section-desc">김지현 사무국장 010-4245-5871<br />윤형관 사무총장 010-5495-6465</p>
          </div>
        </section>
        ${locationSection()}
      </div>
    </main>
  `;
}

function locationSection() {
  const q = encodeURIComponent(venue.searchQuery);
  return `
    <section class="section location-section">
      <div class="section-head">
        <div>
          <p class="section-label">LOCATION</p>
          <h2>오시는 길</h2>
        </div>
        <p>회원 전용 공유공간의 위치와 방문 안내입니다. 방문 전 예약 확정 여부를 확인해 주세요.</p>
      </div>
      <div class="location-grid">
        <div class="card map-card">
          <iframe
            class="map-frame"
            src="https://maps.google.com/maps?q=${q}&output=embed&hl=ko"
            title="${venue.name} 위치 지도"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="card pad location-info">
          <div class="card-icon">${icon("pin")}</div>
          <h3>${venue.name}</h3>
          <p class="location-address">${venue.address}</p>
          <dl class="location-meta">
            <div>
              <dt>운영 시간</dt>
              <dd>${venue.hours}</dd>
            </div>
            <div>
              <dt>방문 문의</dt>
              <dd>${venue.contacts.map((c) => `${c.name} ${c.role} <a href="tel:${c.phone.replace(/-/g, "")}">${c.phone}</a>`).join("<br />")}</dd>
            </div>
          </dl>
          <div class="location-actions">
            <a class="secondary-btn" href="https://map.naver.com/p/search/${q}" target="_blank" rel="noopener noreferrer">네이버 지도</a>
            <a class="secondary-btn" href="https://map.kakao.com/?q=${q}" target="_blank" rel="noopener noreferrer">카카오맵</a>
            <button class="ghost-btn" type="button" onclick="copyAddress(this)">${icon("copy")}주소 복사</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function copyAddress(button) {
  const done = () => {
    if (!button) return;
    const original = button.innerHTML;
    button.innerHTML = `${icon("check")}복사됨`;
    setTimeout(() => {
      button.innerHTML = original;
    }, 1600);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(venue.address).then(done).catch(() => fallbackCopy(venue.address, done));
    return;
  }
  fallbackCopy(venue.address, done);
}

function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
    done();
  } catch (error) {
    window.prompt("주소를 복사하세요", text);
  }
  document.body.removeChild(area);
}

window.copyAddress = copyAddress;

function spaceCarousel(images) {
  const items = images.length > 1 ? [...images, ...images] : images;
  return `
    <div class="space-gallery">
      <div class="space-viewport" aria-label="실내 공간 사진" tabindex="0">
        <div class="space-track">
          ${items.map((image, index) => `
            <figure class="space-slide" ${index >= images.length ? "aria-hidden=\"true\"" : ""}>
              <img src="${image.src}"
                   ${image.small ? `srcset="${image.small} 800w, ${image.src} 1280w"` : ""}
                   sizes="(max-width: 900px) 82vw, 45vw"
                   alt="${index >= images.length ? "" : image.alt}"
                   ${index >= images.length ? 'aria-hidden="true"' : ""}
                   loading="eager" decoding="async" draggable="false" />
            </figure>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// 공간 이미지 자동 스크롤.
// CSS transform(-50%) 방식은 모바일에서 두 가지로 깨졌다.
//  1) -50%를 max-content 너비 기준으로 계산하다 몇 바퀴 뒤 위치가 틀어짐
//  2) 2500px가 넘는 합성 레이어의 이미지 메모리를 브라우저가 중간에 버림
// 그래서 실제 scrollLeft를 픽셀 단위로 움직이는 방식으로 바꿨다.
// 퍼센트 계산이 없고, 화면 밖 영역은 브라우저가 알아서 관리하므로 안정적이다.
let carouselFrame = null;

function stopCarousel() {
  if (carouselFrame !== null) cancelAnimationFrame(carouselFrame);
  carouselFrame = null;
}

function startCarousel() {
  stopCarousel();

  const viewport = document.querySelector(".space-viewport");
  const track = viewport && viewport.querySelector(".space-track");
  if (!viewport || !track || track.children.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SPEED = 26; // 초당 이동 픽셀
  let position = 0;
  let last = null;
  let held = false;

  const loopWidth = () => track.scrollWidth / 2;

  const hold = () => { held = true; };
  const release = () => { held = false; };
  viewport.addEventListener("pointerdown", hold);
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  viewport.addEventListener("pointerleave", release);
  viewport.addEventListener("mouseenter", hold);
  viewport.addEventListener("mouseleave", release);
  viewport.addEventListener("focusin", hold);
  viewport.addEventListener("focusout", release);

  const step = (now) => {
    const width = loopWidth();
    if (width > 0) {
      if (last === null) last = now;
      const elapsed = Math.min((now - last) / 1000, 0.1);
      last = now;

      if (held || document.hidden) {
        // 손가락으로 넘기는 중이면 현재 위치를 그대로 따라간다.
        position = viewport.scrollLeft;
      } else {
        position += SPEED * elapsed;
      }

      if (position >= width) position -= width;
      if (position < 0) position += width;
      viewport.scrollLeft = position;
    }
    carouselFrame = requestAnimationFrame(step);
  };

  carouselFrame = requestAnimationFrame(step);
}

function gradeCard(title, price, benefits, gold) {
  return `
    <div class="card">
      <div class="grade-head ${gold ? "gold" : ""}">
        <strong>${title}</strong>
        <span>${price}</span>
      </div>
      <ul class="benefit-list">
        ${benefits.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

function login() {
  const intentTargets = { reservation: "reservation", myinfo: "myinfo", signup: "signup" };
  const target = intentTargets[state.loginIntent] || "signup";
  const isReservation = state.loginIntent === "reservation";
  const isMyinfo = state.loginIntent === "myinfo";
  const label = isReservation ? "RESERVATION" : isMyinfo ? "MY PAGE" : "MEMBERSHIP";
  const title = isReservation
    ? "예약을 위해 로그인해 주세요"
    : isMyinfo
      ? "내 정보를 보려면 로그인해 주세요"
      : "가입 신청을 위해 로그인해 주세요";
  return `
    ${topbar()}
    <main class="content">
      <section class="grid two" style="align-items:center; min-height:calc(100vh - 160px);">
        <div>
          <p class="section-label">${label}</p>
          <h1>${title}</h1>
          <p class="section-desc">실서비스에서는 카카오 또는 구글 소셜 로그인을 연결합니다. 현재는 프로토타입 흐름 확인용 버튼으로 이동합니다.</p>
        </div>
        <div class="card pad form">
          <button class="primary-btn" style="background:#FEE500;color:#191919;" onclick="setRoute('${target}')">${icon("user")}카카오로 로그인</button>
          <button class="secondary-btn" onclick="setRoute('${target}')">${icon("user")}구글로 로그인</button>
          <div class="grid two">
            <button class="ghost-btn" onclick="setRoute('signup')">${icon("plus")}신규 회원 체험</button>
            <button class="ghost-btn" onclick="setRoute('home')">${icon("home")}기존 회원 체험</button>
          </div>
        </div>
      </section>
    </main>
  `;
}

function shell(kind, content) {
  const nav = routes[kind];
  const mobileNav = nav.slice(0, 4);
  return `
    ${topbar()}
    <div class="app-shell">
      <aside class="sidebar">
        <div class="side-title">
          <strong>${kind === "admin" ? "관리자" : state.member.name}</strong>
          <span>${kind === "admin" ? "운영 도구" : `${state.member.grade} 회원`}</span>
        </div>
        <nav class="nav-list">
          ${nav.map(([route, label]) => `<button class="nav-item ${state.route === route ? "active" : ""}" onclick="setRoute('${route}')">${icon(navIcon(route))}${label}</button>`).join("")}
        </nav>
      </aside>
      <main class="main">${content}</main>
      ${kind === "admin" ? `
      <nav class="mobile-tabs">
        ${mobileNav.map(([route, label]) => `<button class="${state.route === route ? "active" : ""}" onclick="setRoute('${route}')">${icon(navIcon(route))}<span>${label}</span></button>`).join("")}
      </nav>` : ""}
    </div>
  `;
}

const bottomTabs = [
  { key: "home", label: "홈", iconName: "home", match: ["landing", "home"] },
  { key: "reservation", label: "예약하기", iconName: "calendar", match: ["reservation", "confirm", "reservations"] },
  { key: "myinfo", label: "마이페이지", iconName: "user", match: ["myinfo"] },
  { key: "signup", label: "회원가입하기", iconName: "people", match: ["signup", "waiting"] },
];

function tabAction(key) {
  if (key === "home") return state.loggedIn ? "setRoute('home')" : "setRoute('landing')";
  if (key === "signup") return "setLoginIntent('signup')";
  return state.loggedIn ? `setRoute('${key}')` : `setLoginIntent('${key}')`;
}

function activeTabKey() {
  if (state.route === "login") {
    return bottomTabs.some((t) => t.key === state.loginIntent) ? state.loginIntent : "signup";
  }
  const hit = bottomTabs.find((t) => t.match.includes(state.route));
  return hit ? hit.key : "";
}

function mobileTabBar() {
  const active = activeTabKey();
  return `
    <nav class="mobile-tabs" aria-label="주요 메뉴">
      ${bottomTabs.map((t) => `
        <button class="${t.key === active ? "active" : ""}"
                ${t.key === active ? 'aria-current="page"' : ""}
                onclick="${tabAction(t.key)}">${icon(t.iconName)}<span>${t.label}</span></button>
      `).join("")}
    </nav>
  `;
}

function navIcon(route) {
  if (route.includes("approval")) return "people";
  if (route.includes("register")) return "plus";
  if (route.includes("fee") || route.includes("settlement")) return "money";
  if (route.includes("booking") || route.includes("reservation")) return "calendar";
  if (route.includes("myinfo")) return "user";
  if (route.includes("admin")) return "shield";
  return "home";
}

function home() {
  const upcoming = state.bookings.find((item) => item.member === state.member.name && item.status !== "완료");
  return shell("member", `
    <section class="dash-hero">
      <p class="eyebrow">MEMBER HOME</p>
      <h1>${state.member.name}님,<br />오늘도 반갑습니다.</h1>
      <span class="pill ${state.member.grade === "VVIP" ? "gold" : ""}">${state.member.grade}</span>
      <div class="stats">
        <div class="stat"><span>연회비 만료일</span><strong>${state.member.expiresAt}</strong></div>
        <div class="stat"><span>다가오는 예약</span><strong>${upcoming ? "1건" : "없음"}</strong></div>
        <div class="stat"><span>회원 혜택</span><strong>${state.member.grade === "VVIP" ? "공간대여" : "일반이용"}</strong></div>
        <div class="stat"><span>게스트 한도</span><strong>10명</strong></div>
      </div>
    </section>
    <section class="section grid three">
      <button class="card pad" onclick="setRoute('reservation')" style="text-align:left;border-color:transparent;">
        <div class="card-icon">${icon("calendar")}</div>
        <p class="section-label">BOOKING</p>
        <h3>예약하기</h3>
        <p class="section-desc">날짜, 시간, 게스트 인원을 선택합니다.</p>
      </button>
      <button class="card pad" onclick="setRoute('reservations')" style="text-align:left;border-color:transparent;">
        <div class="card-icon">${icon("list")}</div>
        <p class="section-label">HISTORY</p>
        <h3>예약내역</h3>
        <p class="section-desc">다가오는 예약과 지난 예약을 확인합니다.</p>
      </button>
      <button class="card pad" onclick="setRoute('myinfo')" style="text-align:left;border-color:transparent;">
        <div class="card-icon">${icon("user")}</div>
        <p class="section-label">MY PAGE</p>
        <h3>마이페이지</h3>
        <p class="section-desc">회원 정보, 회비, 예약 상태를 확인합니다.</p>
      </button>
    </section>
  `);
}

function signup() {
  const s = state.signup;
  return `
    ${topbar()}
    <main class="content">
      <div class="view-title">
        <div>
          <p class="section-label">MEMBERSHIP</p>
          <h1>가입 신청서</h1>
          <p>운영위원회 승인 후 예약 서비스를 이용하실 수 있습니다.</p>
        </div>
      </div>
      <section class="grid two">
        <div class="card pad form">
          ${field("이름", `<input value="${s.name}" oninput="update('signup.name', this.value)" placeholder="실명을 입력해 주세요" />`)}
          ${field("휴대폰 번호", `<input value="${s.phone}" oninput="update('signup.phone', this.value)" placeholder="010-0000-0000" />`)}
          ${field("희망 등급", `
            <div class="segmented">
              <button class="${s.grade === "VIP" ? "active" : ""}" onclick="update('signup.grade','VIP')">VIP</button>
              <button class="gold ${s.grade === "VVIP" ? "active" : ""}" onclick="update('signup.grade','VVIP')">VVIP</button>
            </div>
          `)}
          ${field("관심 분야", `
            <div class="chips">
              ${["무용", "노래", "악기", "기타"].map((item) => `<button class="chip ${s.interests.includes(item) ? "active" : ""}" onclick="toggleInterest('${item}')">${item}</button>`).join("")}
            </div>
          `)}
          <label class="card pad" style="display:flex;gap:12px;align-items:flex-start;box-shadow:none;">
            <input type="checkbox" ${s.agreed ? "checked" : ""} onchange="update('signup.agreed', this.checked)" style="width:20px;height:20px;accent-color:var(--navy);" />
            <span>개인정보 수집 및 이용에 동의합니다.<br /><small style="color:var(--muted);">수집 항목: 이름, 휴대폰 번호, 관심 분야</small></span>
          </label>
          <button class="primary-btn" onclick="submitSignup()">${icon("check")}신청하기</button>
        </div>
        <aside class="card pad">
          <p class="section-label">PROCESS</p>
          <div class="row"><span>1단계</span><strong>신청 접수</strong></div>
          <div class="row"><span>2단계</span><strong>운영위원회 승인</strong></div>
          <div class="row"><span>3단계</span><strong>회원 이용 시작</strong></div>
        </aside>
      </section>
    </main>
  `;
}

function waiting() {
  return `
    ${topbar()}
    <main class="content">
      <section class="grid two" style="align-items:start;">
        <div class="card pad">
          <span class="pill gold">심사 대기 중</span>
          <h1 style="margin:18px 0 8px;">가입 신청이 접수되었습니다.</h1>
          <p class="section-desc">운영위원회 승인 후 모든 회원 기능을 이용하실 수 있습니다.</p>
          <button class="green-btn" style="margin-top:22px;" onclick="setRoute('home')">${icon("check")}승인 완료 체험하기</button>
        </div>
        <div class="card pad">
          <p class="section-label">TIP</p>
          <h3>홈 화면에 추가하면 편리해요</h3>
          <div class="row"><span>아이폰 Safari</span><strong>공유 버튼, 홈 화면에 추가</strong></div>
          <div class="row"><span>안드로이드 Chrome</span><strong>우상단 메뉴, 홈 화면에 추가</strong></div>
        </div>
      </section>
    </main>
  `;
}

function field(label, control) {
  return `<div class="field"><label>${label}</label>${control}</div>`;
}

function reservation() {
  const r = state.reservation;
  const guestCost = r.guests * 10000;
  return shell("member", `
    <div class="view-title">
      <div>
        <p class="section-label">RESERVATION</p>
        <h1>예약하기</h1>
        <p>이용 날짜와 시간을 선택하고 게스트 인원을 입력해 주세요.</p>
      </div>
    </div>
    <section class="grid two">
      <div class="card pad form">
        ${field("날짜", `<input type="date" value="${r.date}" onchange="update('reservation.date', this.value)" />`)}
        ${field("시간", `
          <div class="segmented" style="display:grid;">
            <button class="${r.time === "오후 6:00 ~ 오후 9:00" ? "active" : ""}" onclick="update('reservation.time','오후 6:00 ~ 오후 9:00')">오후 6:00 ~ 오후 9:00</button>
            <button class="${r.time === "오후 7:00 ~ 오후 10:00" ? "active" : ""}" onclick="update('reservation.time','오후 7:00 ~ 오후 10:00')">오후 7:00 ~ 오후 10:00</button>
          </div>
        `)}
        <div class="field">
          <label>게스트 동반</label>
          <div class="stepper">
            <button onclick="update('reservation.guests', Math.max(0, state.reservation.guests - 1))">-</button>
            <strong>${r.guests}</strong>
            <button onclick="update('reservation.guests', Math.min(10, state.reservation.guests + 1))">+</button>
          </div>
        </div>
        ${state.member.grade === "VVIP" ? `<div class="card pad" style="box-shadow:none;background:#fff8e7;border-color:rgba(218,150,22,.35);"><strong>VVIP 공간 대여 가능</strong><p class="section-desc">단체 행사 공간 대여는 운영진 확인 후 확정됩니다.</p></div>` : ""}
        <button class="primary-btn" onclick="submitReservation()">${icon("calendar")}예약 신청</button>
      </div>
      <aside class="card pad">
        <p class="section-label">SUMMARY</p>
        <div class="row"><span>날짜</span><strong>${formatDate(r.date)}</strong></div>
        <div class="row"><span>시간</span><strong>${r.time || "시간을 선택해 주세요"}</strong></div>
        <div class="row"><span>게스트</span><strong>${r.guests}명</strong></div>
        <div class="row"><span>게스트 이용료</span><strong>${guestCost ? won(guestCost) : "없음"}</strong></div>
      </aside>
    </section>
  `);
}

function confirm() {
  const r = state.reservation;
  return shell("member", `
    <section class="card pad" style="max-width:720px;margin:0 auto;text-align:center;">
      <div style="width:64px;height:64px;border-radius:16px;background:#ecfdf5;color:var(--green);display:grid;place-items:center;margin:0 auto 18px;">${icon("check")}</div>
      <h1>예약 신청이 완료되었습니다.</h1>
      <p class="section-desc">운영진 확인 후 예약 상태가 확정됩니다.</p>
      <div class="card pad" style="box-shadow:none;text-align:left;margin:22px 0;">
        <div class="row"><span>날짜</span><strong>${formatDate(r.date)}</strong></div>
        <div class="row"><span>시간</span><strong>${r.time}</strong></div>
        <div class="row"><span>게스트</span><strong>${r.guests}명</strong></div>
      </div>
      <button class="primary-btn" onclick="setRoute('home')">${icon("home")}홈으로</button>
    </section>
  `);
}

function reservations() {
  const rows = state.bookings.filter((item) => item.member === state.member.name);
  return shell("member", `
    <div class="view-title">
      <div>
        <p class="section-label">BOOKINGS</p>
        <h1>예약내역</h1>
        <p>다가오는 예약과 지난 예약을 확인합니다.</p>
      </div>
    </div>
    <div class="grid">
      ${rows.map((item) => bookingCard(item)).join("") || `<div class="card empty">예약 내역이 없습니다.</div>`}
    </div>
  `);
}

function bookingCard(item) {
  const badge = item.status === "완료" ? "" : item.status === "확정" ? "green" : "gold";
  return `
    <article class="card pad">
      <div class="row">
        <span>${formatDate(item.date)}</span>
        <strong><span class="pill ${badge}">${item.status}</span></strong>
      </div>
      <div class="row"><span>시간</span><strong>${item.time}</strong></div>
      <div class="row"><span>게스트</span><strong>${item.guests ? `${item.guests}명 동반` : "없음"}</strong></div>
    </article>
  `;
}

function myinfo() {
  const upcoming = state.bookings.find((item) => item.member === state.member.name && item.status !== "완료");
  const pastCount = state.bookings.filter((item) => item.member === state.member.name && item.status === "완료").length;
  const guestTotal = state.bookings
    .filter((item) => item.member === state.member.name)
    .reduce((sum, item) => sum + item.guests, 0);
  return shell("member", `
    <div class="view-title">
      <div>
        <p class="section-label">MY PAGE</p>
        <h1>마이페이지</h1>
        <p>회원 정보, 예약 현황, 회비 상태를 한 번에 확인합니다.</p>
      </div>
    </div>
    <section class="grid two">
      <div class="dash-hero">
        <p class="eyebrow">MEMBER</p>
        <h1>${state.member.name}</h1>
        <span class="pill ${state.member.grade === "VVIP" ? "gold" : ""}">${state.member.grade}</span>
        <p style="color:rgba(255,255,255,.7);">${state.member.phone}</p>
        <div class="stats mypage-stats">
          <div class="stat"><span>다가오는 예약</span><strong>${upcoming ? "1건" : "없음"}</strong></div>
          <div class="stat"><span>지난 이용</span><strong>${pastCount}건</strong></div>
          <div class="stat"><span>누적 게스트</span><strong>${guestTotal}명</strong></div>
        </div>
      </div>
      <div class="card pad">
        <p class="section-label">MEMBERSHIP</p>
        <div class="row"><span>회원 등급</span><strong>${state.member.grade}</strong></div>
        <div class="row"><span>연회비 만료일</span><strong>${state.member.expiresAt}</strong></div>
        <div class="row"><span>관심 분야</span><strong>${state.member.interests.join(", ")}</strong></div>
        <button class="ghost-btn" style="margin-top:16px;" onclick="state.member.grade = state.member.grade === 'VIP' ? 'VVIP' : 'VIP'; render();">${icon("refresh")}등급 전환 체험</button>
      </div>
    </section>
    <section class="section grid three">
      <div class="card pad">
        <p class="section-label">NEXT BOOKING</p>
        <h3>${upcoming ? formatDate(upcoming.date) : "예정된 예약 없음"}</h3>
        <p class="section-desc">${upcoming ? `<span class="nowrap">${upcoming.time}</span> · <span class="nowrap">게스트 ${upcoming.guests}명 · ${upcoming.status}</span>` : "필요한 날짜를 선택해 새 예약을 신청해 주세요."}</p>
        <button class="ghost-btn" style="margin-top:16px;" onclick="setRoute('${upcoming ? "reservations" : "reservation"}')">${icon(upcoming ? "list" : "calendar")}${upcoming ? "예약내역 보기" : "예약하기"}</button>
      </div>
      <div class="card pad">
        <p class="section-label">ANNUAL FEE</p>
        <h3>회비 상태</h3>
        <div class="row"><span>납부 상태</span><strong><span class="pill green">정상</span></strong></div>
        <div class="row"><span>만료일</span><strong>${state.member.expiresAt}</strong></div>
      </div>
      <div class="card pad">
        <p class="section-label">SUPPORT</p>
        <h3>문의</h3>
        <p class="section-desc">예약 변경, 회원 정보 수정, 공간 대여 문의는 운영진에게 연락해 주세요.</p>
        <div class="row"><span>사무국장</span><strong>010-4245-5871</strong></div>
        <div class="row"><span>사무총장</span><strong>010-5495-6465</strong></div>
      </div>
    </section>
  `);
}

function adminHome() {
  const pending = state.applications.filter((item) => item.status === "대기").length;
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>관리자 홈</h1>
        <p>가입 승인, 예약 현황, 회비와 게스트 정산을 관리합니다.</p>
      </div>
    </div>
    <section class="grid three">
      ${adminTile("가입 승인", `${pending}건 대기`, "admin-approvals", "people", pending ? "red" : "")}
      ${adminTile("대신 등록", "회원 직접 등록", "admin-register", "plus")}
      ${adminTile("회비 관리", "납부 및 만료일", "admin-fees", "money")}
      ${adminTile("예약 현황", "신청 및 확정", "admin-bookings", "calendar")}
      ${adminTile("게스트 정산", "이용료 합계", "admin-settlement", "check")}
    </section>
  `);
}

function adminTile(title, desc, route, iconName, badge) {
  return `
    <button class="card pad" onclick="setRoute('${route}')" style="text-align:left;border-color:transparent;">
      <div style="display:flex;justify-content:space-between;gap:12px;">
        <div style="color:var(--navy);">${icon(iconName)}</div>
        ${badge ? `<span class="pill red">확인 필요</span>` : ""}
      </div>
      <h3>${title}</h3>
      <p class="section-desc">${desc}</p>
    </button>
  `;
}

function adminApprovals() {
  return shell("admin", adminTableView("가입 승인", "회원 가입 신청을 승인하거나 반려합니다.", `
    <table>
      <thead><tr><th>이름</th><th>연락처</th><th>희망 등급</th><th>관심 분야</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>
        ${state.applications.map((item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td><span class="pill ${item.grade === "VVIP" ? "gold" : ""}">${item.grade}</span></td>
            <td>${item.interests}</td>
            <td>${item.status}</td>
            <td>
              <div class="table-actions">
                <button class="mini-btn green" onclick="approveApplication(${item.id})">${icon("check")}승인</button>
                <button class="mini-btn danger" onclick="rejectApplication(${item.id})">${icon("x")}반려</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `));
}

function adminRegister() {
  const f = state.adminForm;
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>대신 등록</h1>
        <p>전화나 현장 접수 회원을 운영진이 직접 등록합니다.</p>
      </div>
    </div>
    <section class="grid two">
      <div class="card pad form">
        ${field("이름", `<input value="${f.name}" oninput="update('adminForm.name', this.value)" placeholder="회원 이름" />`)}
        ${field("휴대폰 번호", `<input value="${f.phone}" oninput="update('adminForm.phone', this.value)" placeholder="010-0000-0000" />`)}
        ${field("회원 등급", `
          <select onchange="update('adminForm.grade', this.value)">
            <option ${f.grade === "VIP" ? "selected" : ""}>VIP</option>
            <option ${f.grade === "VVIP" ? "selected" : ""}>VVIP</option>
          </select>
        `)}
        ${field("연회비 만료일", `<input type="date" value="${f.expiresAt}" onchange="update('adminForm.expiresAt', this.value)" />`)}
        <button class="primary-btn" onclick="addMemberByAdmin()">${icon("plus")}회원 등록</button>
      </div>
      <div class="card pad">
        <p class="section-label">RECENT MEMBERS</p>
        ${state.members.slice(0, 4).map((item) => `<div class="row"><span>${item.name}</span><strong>${item.grade}</strong></div>`).join("")}
      </div>
    </section>
  `);
}

function adminFees() {
  return shell("admin", adminTableView("회비 관리", "회원별 납부 상태와 만료일을 관리합니다.", `
    <table>
      <thead><tr><th>회원</th><th>등급</th><th>연락처</th><th>만료일</th><th>납부 상태</th><th>처리</th></tr></thead>
      <tbody>
        ${state.members.map((item) => `
          <tr>
            <td>${item.name}</td>
            <td><span class="pill ${item.grade === "VVIP" ? "gold" : ""}">${item.grade}</span></td>
            <td>${item.phone}</td>
            <td>${item.expiresAt}</td>
            <td><span class="pill ${item.paid ? "green" : "red"}">${item.paid ? "납부" : "미납"}</span></td>
            <td><button class="mini-btn primary" onclick="const m=state.members.find(x=>x.id===${item.id});m.paid=!m.paid;render();">${icon("refresh")}상태 변경</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `));
}

function adminBookings() {
  return shell("admin", adminTableView("예약 현황", "전체 예약 신청과 확정 상태를 확인합니다.", `
    <table>
      <thead><tr><th>회원</th><th>날짜</th><th>시간</th><th>게스트</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>
        ${state.bookings.map((item) => `
          <tr>
            <td>${item.member}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.time}</td>
            <td>${item.guests}명</td>
            <td><span class="pill ${item.status === "확정" ? "green" : item.status === "신청" ? "gold" : ""}">${item.status}</span></td>
            <td>
              <div class="table-actions">
                <button class="mini-btn green" onclick="const b=state.bookings.find(x=>x.id===${item.id});b.status='확정';render();">${icon("check")}확정</button>
                <button class="mini-btn" onclick="const b=state.bookings.find(x=>x.id===${item.id});b.status='완료';render();">${icon("check")}완료</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `));
}

function adminSettlement() {
  const totalGuests = state.bookings.reduce((sum, item) => sum + item.guests, 0);
  const total = totalGuests * 10000;
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>게스트 정산</h1>
        <p>게스트 이용료는 1인당 10,000원으로 계산합니다.</p>
      </div>
    </div>
    <section class="grid two">
      <div class="dash-hero">
        <p class="eyebrow">TOTAL</p>
        <h1>${won(total)}</h1>
        <p style="color:rgba(255,255,255,.72);">총 게스트 ${totalGuests}명 기준</p>
      </div>
      <div class="card pad">
        ${state.bookings.map((item) => `<div class="row"><span>${item.member} · ${formatDate(item.date)}</span><strong>${won(item.guests * 10000)}</strong></div>`).join("")}
      </div>
    </section>
  `);
}

function adminTableView(title, desc, table) {
  return `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>${title}</h1>
        <p>${desc}</p>
      </div>
    </div>
    <section class="card table-wrap">${table}</section>
  `;
}

function render() {
  const views = {
    landing,
    login,
    signup,
    waiting,
    home,
    reservation,
    confirm,
    reservations,
    myinfo,
    admin: adminHome,
    "admin-approvals": adminApprovals,
    "admin-register": adminRegister,
    "admin-fees": adminFees,
    "admin-bookings": adminBookings,
    "admin-settlement": adminSettlement,
  };
  const view = views[state.route] || landing;
  const isAdmin = state.route.startsWith("admin");
  app.innerHTML = `<div class="app">${view()}${isAdmin ? "" : mobileTabBar()}</div>`;
  startCarousel();
}

Object.assign(window, {
  setRoute,
  setLoginIntent,
  update,
  toggleInterest,
  submitSignup,
  submitReservation,
  approveApplication,
  rejectApplication,
  addMemberByAdmin,
  render,
});

render();

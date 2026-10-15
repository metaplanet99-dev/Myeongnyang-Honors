const app = document.querySelector("#app");

// 데모 데이터를 '오늘' 기준으로 만든다. 그래야 만료 임박이 항상 의미가 있다.
const TODAY = new Date();

// toISOString()은 UTC로 변환해 한국 시간 기준으로 하루가 밀린다.
// 날짜만 다룰 때는 로컬 기준으로 직접 문자열을 만든다.
function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayOffset(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return toYMD(d);
}
// 게스트 이용료 입금 계좌.
// TODO: 재단에서 실제 계좌를 받으면 교체할 것. 지금 번호는 화면 확인용이다.
const bankAccount = {
  bank: "국민은행",
  number: "123456-78-901234",
  holder: "(재)명량문화재단",
};

const GUEST_FEE = 10000;

// 입금 기한은 이용일 '전날'까지.
function dueDateFor(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString + "T00:00:00");
  d.setDate(d.getDate() - 1);
  return toYMD(d);
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString + "T00:00:00");
  const t = new Date(toYMD(TODAY) + "T00:00:00");
  return Math.round((d - t) / 86400000);
}

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
    { id: 1, name: "홍길동", grade: "VVIP", phone: "010-4245-5871", paid: true, joinedAt: dayOffset(-320), expiresAt: dayOffset(77), memo: "피아노 조율 요청하신 적 있음. 게스트 많이 동반하심." },
    { id: 2, name: "정하늘", grade: "VIP", phone: "010-2401-1188", paid: true, joinedAt: dayOffset(-350), expiresAt: dayOffset(5), memo: "" },
    { id: 3, name: "문소리", grade: "VIP", phone: "010-9981-5512", paid: false, joinedAt: dayOffset(-400), expiresAt: dayOffset(-14), memo: "연회비 미납. 9월에 통화함." },
    { id: 4, name: "김도윤", grade: "VVIP", phone: "010-3388-2041", paid: true, joinedAt: dayOffset(-120), expiresAt: dayOffset(21), memo: "" },
    { id: 5, name: "박서진", grade: "VIP", phone: "010-7742-6610", paid: true, joinedAt: dayOffset(-200), expiresAt: dayOffset(28), memo: "주로 평일 저녁 이용." },
    { id: 6, name: "이수현", grade: "VIP", phone: "010-5510-7723", paid: false, joinedAt: dayOffset(-45), expiresAt: dayOffset(320), memo: "" },
    { id: 7, name: "최은비", grade: "VVIP", phone: "010-2277-9034", paid: true, joinedAt: dayOffset(-60), expiresAt: dayOffset(305), memo: "단체 행사 문의 주심." },
    { id: 8, name: "장민호", grade: "VIP", phone: "010-6612-3380", paid: true, joinedAt: dayOffset(-280), expiresAt: dayOffset(85), memo: "" },
  ],
  bookings: [
    // 입금 완료 -> 확정
    { id: 1, memberId: 1, member: "홍길동", date: dayOffset(6), time: "오후 6:00 ~ 오후 9:00", guests: 2, status: "확정", paid: true },
    // 게스트 없음 -> 낼 돈이 없어 바로 확정
    { id: 2, memberId: 2, member: "정하늘", date: dayOffset(4), time: "오후 7:00 ~ 오후 10:00", guests: 0, status: "확정", paid: true },
    // 입금 대기 (기한 여유)
    { id: 3, memberId: 4, member: "김도윤", date: dayOffset(5), time: "오후 6:00 ~ 오후 9:00", guests: 4, status: "입금대기", paid: false },
    // 입금 대기 (기한 오늘까지 - 독촉 대상)
    { id: 7, memberId: 7, member: "최은비", date: dayOffset(1), time: "오후 6:00 ~ 오후 9:00", guests: 6, status: "입금대기", paid: false },
    // 기한 지남 -> 취소 예정
    { id: 8, memberId: 8, member: "장민호", date: dayOffset(-1), time: "오후 7:00 ~ 오후 10:00", guests: 3, status: "입금대기", paid: false },
    { id: 4, memberId: 1, member: "홍길동", date: dayOffset(-9), time: "오후 6:00 ~ 오후 9:00", guests: 1, status: "완료", paid: true },
    { id: 5, memberId: 3, member: "문소리", date: dayOffset(-25), time: "오후 6:00 ~ 오후 9:00", guests: 1, status: "완료", paid: true },
    { id: 6, memberId: 5, member: "박서진", date: dayOffset(-40), time: "오후 7:00 ~ 오후 10:00", guests: 3, status: "완료", paid: true },
  ],
  messages: [
    { id: 1, memberId: 3, name: "문소리", phone: "010-9981-5512", kind: "만료 안내", auto: true, sentAt: dayOffset(-44), text: "문소리님의 VIP 회원 기간이 곧 만료됩니다. 연회비 안내드립니다." },
    { id: 2, memberId: 5, name: "박서진", phone: "010-7742-6610", kind: "예약 확정", auto: true, sentAt: dayOffset(-41), text: "박서진님의 예약이 확정되었습니다." },
    { id: 3, memberId: 7, name: "최은비", phone: "010-2277-9034", kind: "가입 승인", auto: true, sentAt: dayOffset(-60), text: "최은비님, 명량아너스클럽 VVIP 회원 가입이 승인되었습니다." },
  ],
  memberFilter: { q: "", grade: "전체", status: "전체" },
  selectedMemberId: 1,
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
  hours: "매주 오후 6:00 ~ 오후 10:00",
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
    ["admin-payments", "입금 확인"],
    ["admin-members", "회원 명단"],
    ["admin-approvals", "가입 승인"],
    ["admin-bookings", "예약 현황"],
    ["admin-messages", "문자 발송"],
    ["admin-register", "회원 등록"],
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
  const guests = state.reservation.guests;
  const booking = {
    id: Date.now(),
    memberId: state.member.id || 1,
    member: state.member.name,
    date: state.reservation.date,
    time: state.reservation.time,
    guests,
    // 게스트가 없으면 낼 돈이 없으므로 바로 확정된다.
    status: guests > 0 ? "입금대기" : "확정",
    paid: guests === 0,
  };
  state.bookings.unshift(booking);
  state.lastBookingId = booking.id;
  setRoute("confirm");
}

function approveApplication(id) {
  const application = state.applications.find((item) => item.id === id);
  if (!application) return;
  application.status = "승인";
  const member = {
    id: Date.now(),
    name: application.name,
    grade: application.grade,
    phone: application.phone,
    paid: false,
    joinedAt: dayOffset(0),
    expiresAt: dayOffset(365),
    memo: "",
  };
  state.members.push(member);
  logMessage(member, "가입 승인", `${member.name}님, 명량아너스클럽 ${member.grade} 회원 가입이 승인되었습니다.`, true);
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
  const member = {
    id: Date.now(),
    name: form.name.trim(),
    phone: form.phone.trim(),
    grade: form.grade,
    expiresAt: form.expiresAt,
    joinedAt: dayOffset(0),
    paid: false,
    memo: "",
  };
  state.members.unshift(member);
  state.adminForm = { name: "", phone: "", grade: "VIP", expiresAt: dayOffset(365) };
  state.selectedMemberId = member.id;
  setRoute("admin-members");
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
            ${gradeCard("VIP", "연회비 300,000원", [
              "게스트 동반입장 가능 (10명 이내)",
              "음식물, 음료 반입 가능",
            ], false)}
            ${gradeCard("VVIP", "연회비 1,000,000원", [
              "게스트 동반입장 가능 (10명 이내)",
              "음식물, 음료 반입 가능",
              "단체행사 공간 대여 가능",
              "무용 · 노래 · 인스트루먼트 교육 50% 할인",
            ], true)}
          </div>
        </section>
        ${guestAndRentalSection()}
        <section class="section grid three">
          <div class="card pad">
            <div class="card-icon">${icon("check")}</div>
            <p class="section-label">QUALIFICATION</p>
            <h3>가입 자격</h3>
            <p class="section-desc">음악과 예술을 사랑하는 남녀 중 운영위원회 승인을 받은 자</p>
          </div>
          <div class="card pad">
            <div class="card-icon">${icon("clock")}</div>
            <p class="section-label">HOURS</p>
            <h3>운영 시간</h3>
            <p class="section-desc">매주 오후 6:00 ~ 오후 10:00</p>
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

// 회원 모집 안내문의 '동반게스트 이용 안내'와 '공간대여' 항목.
// 금액·시간은 안내문 원본 기준이므로 임의로 고치지 말 것.
const guestPolicy = [
  ["이용료", "1인당 10,000원", "VIP · VVIP 동일"],
  ["이용 시간", "VIP 3시간 · VVIP 무제한", ""],
  ["동반 인원", "10명 이내", ""],
];

const rentalPolicy = [
  ["대여 시간", "오전 10:00 ~ 오후 10:00", ""],
  ["이용 단위", "1회 3시간", ""],
  ["이용료", "1인당 10,000원", ""],
  ["제공", "커피 · 음료 무료 제공", ""],
];

function specList(rows) {
  return `
    <dl class="spec-list">
      ${rows.map(([label, value, note]) => `
        <div>
          <dt>${label}</dt>
          <dd>${value}${note ? `<span class="spec-note">${note}</span>` : ""}</dd>
        </div>
      `).join("")}
    </dl>
  `;
}

function guestAndRentalSection() {
  return `
    <section class="section">
      <div class="section-head centered">
        <div>
          <p class="section-label">GUEST &amp; RENTAL</p>
          <h2>동반 게스트 · 공간 대여</h2>
        </div>
        <p>회원과 함께 오시는 게스트, 그리고 단체 행사를 위한 공간 대여 안내입니다.</p>
      </div>
      <div class="grid two">
        <div class="card pad">
          <div class="card-icon">${icon("people")}</div>
          <h3>동반 게스트</h3>
          ${specList(guestPolicy)}
        </div>
        <div class="card pad">
          <div class="card-icon">${icon("calendar")}</div>
          <h3>공간 대여</h3>
          ${specList(rentalPolicy)}
        </div>
      </div>
    </section>
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
  const amount = r.guests * GUEST_FEE;
  const due = dueDateFor(r.date);
  return shell("member", `
    <section class="card pad" style="max-width:720px;margin:0 auto;text-align:center;">
      <div style="width:64px;height:64px;border-radius:16px;background:#ecfdf5;color:var(--green);display:grid;place-items:center;margin:0 auto 18px;">${icon("check")}</div>
      <h1>예약 신청이 완료되었습니다.</h1>
      <p class="section-desc">${amount ? "아래 계좌로 입금해 주시면 예약이 확정됩니다." : "게스트 동반이 없어 추가 비용 없이 확정되었습니다."}</p>

      <div class="card pad" style="box-shadow:none;text-align:left;margin:22px 0;">
        <div class="row"><span>날짜</span><strong>${formatDate(r.date)}</strong></div>
        <div class="row"><span>시간</span><strong>${r.time}</strong></div>
        <div class="row"><span>게스트</span><strong>${r.guests}명</strong></div>
      </div>

      ${amount ? `
        <div class="pay-box">
          <p class="pay-label">입금하실 금액</p>
          <p class="pay-amount">${won(amount)}</p>
          <p class="pay-sub">게스트 ${r.guests}명 × ${won(GUEST_FEE)}</p>

          <dl class="spec-list">
            <div><dt>입금 계좌</dt><dd>${bankAccount.bank} ${bankAccount.number}</dd></div>
            <div><dt>예금주</dt><dd>${bankAccount.holder}</dd></div>
            <div><dt>입금자명</dt><dd><strong>${state.member.name}</strong> (회원 본인 이름으로 입금해 주세요)</dd></div>
            <div><dt>입금 기한</dt><dd><strong>${formatDate(due)}</strong>까지</dd></div>
          </dl>

          <p class="pay-warn">${icon("clock")}기한까지 입금이 확인되지 않으면 예약이 자동으로 취소됩니다.</p>
        </div>
      ` : ""}

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
  const badge = item.status === "확정" ? "green"
    : item.status === "입금대기" ? "gold"
    : item.status === "취소" ? "red" : "";
  const amount = item.guests * GUEST_FEE;
  const due = dueDateFor(item.date);
  const left = daysUntil(due);
  return `
    <article class="card pad ${item.status === "취소" ? "is-cancelled" : ""}">
      <div class="row">
        <span>${formatDate(item.date)}</span>
        <strong><span class="pill ${badge}">${item.status}</span></strong>
      </div>
      <div class="row"><span>시간</span><strong>${item.time}</strong></div>
      <div class="row"><span>게스트</span><strong>${item.guests ? `${item.guests}명 동반` : "없음"}</strong></div>
      ${amount ? `<div class="row"><span>게스트 이용료</span><strong>${won(amount)}</strong></div>` : ""}
      ${item.status === "입금대기" ? `
        <div class="pay-notice">
          ${icon("clock")}
          <span><strong>${formatDate(due)}</strong>까지 입금해 주세요${left !== null && left >= 0 ? ` (${left === 0 ? "오늘" : "D-" + left})` : ""}<br />
          ${bankAccount.bank} ${bankAccount.number} · 예금주 ${bankAccount.holder}</span>
        </div>` : ""}
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

// ---------------------------------------------------------------------------
// 관리자 화면
// 담당자 한 분이 그동안 엑셀로 하던 일(명단 정리, 만료 확인, 문자 발송)을
// 대신하는 것이 목적이다. PC 기준으로 넓게 쓰고, 폰에서는 세로로 쌓인다.
// ---------------------------------------------------------------------------

const EXPIRY_SOON_DAYS = 30; // 만료 임박으로 볼 기준

function logMessage(member, kind, text, auto) {
  state.messages.unshift({
    id: Date.now() + Math.random(),
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    kind,
    auto: !!auto,
    sentAt: dayOffset(0),
    text,
  });
}

function adminStats() {
  const expiring = state.members
    .filter((m) => {
      const d = daysUntil(m.expiresAt);
      return d !== null && d <= EXPIRY_SOON_DAYS;
    })
    .sort((a, b) => daysUntil(a.expiresAt) - daysUntil(b.expiresAt));
  const unpaid = state.members.filter((m) => !m.paid);
  const pending = state.applications.filter((a) => a.status === "대기");
  const upcoming = state.bookings
    .filter((b) => {
      const d = daysUntil(b.date);
      return d !== null && d >= 0 && d <= 7;
    })
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
  // 입금 대기 = 게스트 이용료를 아직 못 받은 예약
  const awaiting = state.bookings
    .filter((b) => b.status === "입금대기")
    .sort((a, b) => (dueDateFor(a.date) < dueDateFor(b.date) ? -1 : 1));
  // 기한이 지났는데도 입금이 없는 건. 바로 취소하지 않고 담당자 확인을 받는다.
  const overdue = awaiting.filter((b) => daysUntil(dueDateFor(b.date)) < 0);
  const awaitingAmount = awaiting.reduce((sum, b) => sum + b.guests * GUEST_FEE, 0);
  return { expiring, unpaid, pending, upcoming, awaiting, overdue, awaitingAmount };
}

function statCard(label, count, unit, route, tone) {
  return `
    <button class="stat-card ${tone || ""}" onclick="setRoute('${route}')">
      <span class="stat-card-label">${label}</span>
      <strong class="stat-card-value">${count}<em>${unit}</em></strong>
    </button>
  `;
}

function expiryBadge(dateString) {
  const d = daysUntil(dateString);
  if (d === null) return "";
  if (d < 0) return `<span class="pill red">만료 ${-d}일 지남</span>`;
  if (d === 0) return `<span class="pill red">오늘 만료</span>`;
  if (d <= EXPIRY_SOON_DAYS) return `<span class="pill gold">D-${d}</span>`;
  return `<span class="pill">D-${d}</span>`;
}

function sentBadge(memberId, kind) {
  const hit = state.messages.find((m) => m.memberId === memberId && m.kind === kind);
  if (!hit) return `<span class="sent-no">미발송</span>`;
  return `<span class="sent-yes">${icon("check")}${formatDate(hit.sentAt)} 발송</span>`;
}

function adminHome() {
  const { expiring, unpaid, pending, upcoming, awaiting, overdue } = adminStats();
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>오늘 확인할 것</h1>
        <p>만료가 다가온 회원과 처리할 일만 모아 보여 드립니다. 문자는 자동으로 나갑니다.</p>
      </div>
    </div>

    <section class="stat-row">
      ${statCard("입금 확인 필요", awaiting.length, "건", "admin-payments", awaiting.length ? "warn" : "")}
      ${statCard("기한 지남", overdue.length, "건", "admin-payments", overdue.length ? "danger" : "")}
      ${statCard("만료 임박", expiring.length, "명", "admin-members", expiring.length ? "warn" : "")}
      ${statCard("가입 승인 대기", pending.length, "명", "admin-approvals", pending.length ? "danger" : "")}
    </section>

    <section class="panel-grid">
      <div class="card panel ${overdue.length ? "panel-alert" : ""}">
        <div class="panel-head">
          <h3>${icon("money")}게스트 이용료 입금 확인</h3>
          <span class="panel-note">통장 확인 후 눌러 주세요</span>
        </div>
        ${awaiting.length ? `
          <div class="panel-list">
            ${awaiting.slice(0, 5).map((b) => paymentRow(b)).join("")}
          </div>
          ${awaiting.length > 5 ? `<p class="panel-note" style="padding:10px 0;">외 ${awaiting.length - 5}건 · <button class="link-btn" onclick="setRoute('admin-payments')">전체 보기</button></p>` : ""}
        ` : `<p class="panel-empty">입금 확인이 필요한 예약이 없습니다.</p>`}
      </div>

      <div class="card panel">
        <div class="panel-head">
          <h3>${icon("clock")}연회비 만료 임박</h3>
          <span class="panel-note">만료 ${EXPIRY_SOON_DAYS}일 전 자동 발송</span>
        </div>
        ${expiring.length ? `
          <div class="panel-list">
            ${expiring.map((m) => `
              <div class="panel-row">
                <div class="panel-row-main">
                  <strong>${m.name}</strong>
                  <span class="pill ${m.grade === "VVIP" ? "gold" : ""}">${m.grade}</span>
                  ${expiryBadge(m.expiresAt)}
                </div>
                <div class="panel-row-sub">
                  <span>${formatDate(m.expiresAt)} 만료 · ${m.phone}</span>
                  ${sentBadge(m.id, "만료 안내")}
                </div>
                <div class="panel-row-actions">
                  <button class="mini-btn primary" onclick="sendManual(${m.id}, '만료 안내')">${icon("phone")}문자 보내기</button>
                  <button class="mini-btn" onclick="selectMember(${m.id})">${icon("user")}회원 보기</button>
                </div>
              </div>
            `).join("")}
          </div>
        ` : `<p class="panel-empty">만료가 임박한 회원이 없습니다.</p>`}
      </div>

      <div class="card panel">
        <div class="panel-head">
          <h3>${icon("people")}가입 승인 대기</h3>
          <span class="panel-note">승인 시 문자 자동 발송</span>
        </div>
        ${pending.length ? `
          <div class="panel-list">
            ${pending.map((a) => `
              <div class="panel-row">
                <div class="panel-row-main">
                  <strong>${a.name}</strong>
                  <span class="pill ${a.grade === "VVIP" ? "gold" : ""}">${a.grade}</span>
                </div>
                <div class="panel-row-sub"><span>${a.phone} · 관심 분야 ${a.interests}</span></div>
                <div class="panel-row-actions">
                  <button class="mini-btn green" onclick="approveApplication(${a.id})">${icon("check")}승인</button>
                  <button class="mini-btn danger" onclick="rejectApplication(${a.id})">${icon("x")}반려</button>
                </div>
              </div>
            `).join("")}
          </div>
        ` : `<p class="panel-empty">대기 중인 신청이 없습니다.</p>`}
      </div>

      <div class="card panel">
        <div class="panel-head">
          <h3>${icon("calendar")}이번 주 예약</h3>
          <span class="panel-note">오늘부터 7일</span>
        </div>
        ${upcoming.length ? `
          <div class="panel-list">
            ${upcoming.map((b) => `
              <div class="panel-row">
                <div class="panel-row-main">
                  <strong>${b.member}</strong>
                  <span class="pill ${b.status === "확정" ? "green" : "gold"}">${b.status}</span>
                </div>
                <div class="panel-row-sub"><span>${formatDate(b.date)} · ${b.time} · 게스트 ${b.guests}명</span></div>
                ${b.status === "신청" ? `
                  <div class="panel-row-actions">
                    <button class="mini-btn green" onclick="confirmBooking(${b.id})">${icon("check")}확정하고 문자 보내기</button>
                  </div>` : ""}
              </div>
            `).join("")}
          </div>
        ` : `<p class="panel-empty">이번 주 예약이 없습니다.</p>`}
      </div>

      <div class="card panel">
        <div class="panel-head">
          <h3>${icon("money")}회비 미납</h3>
          <span class="panel-note">입금 확인 후 눌러 주세요</span>
        </div>
        ${unpaid.length ? `
          <div class="panel-list">
            ${unpaid.map((m) => `
              <div class="panel-row">
                <div class="panel-row-main">
                  <strong>${m.name}</strong>
                  <span class="pill ${m.grade === "VVIP" ? "gold" : ""}">${m.grade}</span>
                  <span class="pill red">미납</span>
                </div>
                <div class="panel-row-sub"><span>${m.phone} · ${formatDate(m.expiresAt)} 만료</span></div>
                <div class="panel-row-actions">
                  <button class="mini-btn green" onclick="togglePaid(${m.id})">${icon("check")}입금 확인됨</button>
                </div>
              </div>
            `).join("")}
          </div>
        ` : `<p class="panel-empty">미납 회원이 없습니다.</p>`}
      </div>
    </section>
  `);
}

// 입금 대기 한 건을 보여주는 줄. 통장과 대조하기 쉽도록
// '입금자명(회원 이름)'과 '금액'을 가장 크게 보여준다.
function paymentRow(b) {
  const amount = b.guests * GUEST_FEE;
  const due = dueDateFor(b.date);
  const left = daysUntil(due);
  const isOverdue = left < 0;
  return `
    <div class="panel-row ${isOverdue ? "row-overdue" : ""}">
      <div class="panel-row-main">
        <strong>${b.member}</strong>
        <span class="pay-amount-inline">${won(amount)}</span>
        ${isOverdue
          ? `<span class="pill red">기한 ${-left}일 지남</span>`
          : left === 0
            ? `<span class="pill gold">오늘까지</span>`
            : `<span class="pill gold">D-${left}</span>`}
      </div>
      <div class="panel-row-sub">
        <span>이용 ${formatDate(b.date)} · 게스트 ${b.guests}명 · 입금 기한 ${formatDate(due)}</span>
      </div>
      <div class="panel-row-actions">
        <button class="mini-btn green" onclick="confirmPayment(${b.id})">${icon("check")}입금 확인됨</button>
        <button class="mini-btn primary" onclick="sendPaymentReminder(${b.id})">${icon("phone")}독촉 문자</button>
        ${isOverdue ? `<button class="mini-btn danger" onclick="cancelUnpaid(${b.id})">${icon("x")}취소 처리</button>` : ""}
      </div>
    </div>
  `;
}

function adminPayments() {
  const { awaiting, overdue, awaitingAmount } = adminStats();
  const paidRecently = state.bookings
    .filter((b) => b.paid && b.guests > 0 && b.status !== "취소")
    .slice(0, 8);
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>입금 확인</h1>
        <p>게스트 이용료는 계좌이체로 받습니다. 통장에서 확인하신 뒤 아래에서 눌러 주세요.</p>
      </div>
    </div>

    <section class="stat-row">
      ${statCard("입금 확인 필요", awaiting.length, "건", "admin-payments", awaiting.length ? "warn" : "")}
      ${statCard("기한 지남", overdue.length, "건", "admin-payments", overdue.length ? "danger" : "")}
      <div class="stat-card">
        <span class="stat-card-label">받을 금액 합계</span>
        <strong class="stat-card-value">${won(awaitingAmount)}</strong>
      </div>
      <div class="stat-card">
        <span class="stat-card-label">입금 계좌</span>
        <strong class="stat-card-value" style="font-size:16px;line-height:1.5;">
          ${bankAccount.bank} ${bankAccount.number}<br />
          <em style="margin:0;">예금주 ${bankAccount.holder}</em>
        </strong>
      </div>
    </section>

    ${overdue.length ? `
      <section class="card panel panel-alert" style="margin-bottom:14px;">
        <div class="panel-head">
          <h3>${icon("x")}기한이 지난 예약 ${overdue.length}건</h3>
          <span class="panel-note">자동으로 취소하지 않습니다</span>
        </div>
        <p class="panel-empty" style="margin:12px 0;">
          입금을 받으셨는데 확인을 못 누르신 경우가 있을 수 있어, 시스템이 임의로 취소하지 않습니다.
          통장을 확인하신 뒤 <strong>입금 확인됨</strong> 또는 <strong>취소 처리</strong>를 눌러 주세요.
        </p>
        <div class="panel-row-actions" style="padding-bottom:14px;">
          <button class="mini-btn danger" onclick="cancelAllOverdue()">${icon("x")}${overdue.length}건 모두 취소 처리</button>
        </div>
      </section>` : ""}

    <section class="card panel">
      <div class="panel-head">
        <h3>${icon("money")}입금 대기</h3>
        <span class="panel-note">기한이 급한 순서</span>
      </div>
      ${awaiting.length
        ? `<div class="panel-list">${awaiting.map((b) => paymentRow(b)).join("")}</div>`
        : `<p class="panel-empty">입금 확인이 필요한 예약이 없습니다.</p>`}
    </section>

    <section class="card table-wrap" style="margin-top:14px;">
      <table>
        <thead><tr><th>회원</th><th>이용일</th><th>게스트</th><th>금액</th><th>상태</th></tr></thead>
        <tbody>
          ${paidRecently.map((b) => `
            <tr>
              <td>${b.member}</td>
              <td>${formatDate(b.date)}</td>
              <td>${b.guests}명</td>
              <td>${won(b.guests * GUEST_FEE)}</td>
              <td><span class="pill green">입금 완료</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `);
}

function confirmPayment(id) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return;
  b.paid = true;
  b.status = "확정";
  const m = state.members.find((x) => x.id === b.memberId);
  if (m) {
    logMessage(m, "예약 확정",
      `${m.name}님, 입금이 확인되어 예약이 확정되었습니다. ${formatDate(b.date)} ${b.time}`, true);
  }
  render();
}

function sendPaymentReminder(id) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return;
  const m = state.members.find((x) => x.id === b.memberId);
  if (!m) return;
  logMessage(m, "입금 독촉",
    `${m.name}님, ${formatDate(b.date)} 예약의 게스트 이용료 ${won(b.guests * GUEST_FEE)}이 아직 입금되지 않았습니다. ${formatDate(dueDateFor(b.date))}까지 입금해 주세요.`,
    false);
  render();
}

function cancelUnpaid(id) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return;
  b.status = "취소";
  const m = state.members.find((x) => x.id === b.memberId);
  if (m) {
    logMessage(m, "예약 취소",
      `${m.name}님, ${formatDate(b.date)} 예약이 입금 기한 경과로 취소되었습니다.`, true);
  }
  render();
}

function cancelAllOverdue() {
  const { overdue } = adminStats();
  overdue.forEach((b) => {
    b.status = "취소";
    const m = state.members.find((x) => x.id === b.memberId);
    if (m) {
      logMessage(m, "예약 취소",
        `${m.name}님, ${formatDate(b.date)} 예약이 입금 기한 경과로 취소되었습니다.`, true);
    }
  });
  render();
}

function filteredMembers() {
  const f = state.memberFilter;
  const q = f.q.trim();
  return state.members.filter((m) => {
    if (q && !m.name.includes(q) && !m.phone.includes(q)) return false;
    if (f.grade !== "전체" && m.grade !== f.grade) return false;
    if (f.status === "만료 임박") {
      const d = daysUntil(m.expiresAt);
      if (d === null || d > EXPIRY_SOON_DAYS) return false;
    }
    if (f.status === "미납" && m.paid) return false;
    return true;
  });
}

function adminMembers() {
  const list = filteredMembers();
  const f = state.memberFilter;
  const selected = state.members.find((m) => m.id === state.selectedMemberId) || list[0];
  const chip = (key, value, label) =>
    `<button class="filter-chip ${f[key] === value ? "active" : ""}" onclick="setMemberFilter('${key}','${value}')">${label}</button>`;

  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>회원 명단</h1>
        <p>엑셀로 관리하시던 명단입니다. 이름이나 번호 일부만 입력해도 찾을 수 있습니다.</p>
      </div>
    </div>

    <section class="member-layout">
      <div class="card member-list-card">
        <div class="filter-bar">
          <input class="search-input" value="${f.q}" oninput="setMemberFilter('q', this.value)"
                 placeholder="이름 또는 번호로 검색" />
          <div class="filter-chips">
            ${chip("grade", "전체", "전체 등급")}
            ${chip("grade", "VIP", "VIP")}
            ${chip("grade", "VVIP", "VVIP")}
          </div>
          <div class="filter-chips">
            ${chip("status", "전체", "전체")}
            ${chip("status", "만료 임박", "만료 임박")}
            ${chip("status", "미납", "미납")}
          </div>
        </div>
        <p class="list-count">${list.length}명</p>
        <div class="member-list">
          ${list.length ? list.map((m) => `
            <button class="member-row ${selected && selected.id === m.id ? "active" : ""}" onclick="selectMember(${m.id})">
              <span class="member-row-name">
                <strong>${m.name}</strong>
                <span class="pill ${m.grade === "VVIP" ? "gold" : ""}">${m.grade}</span>
              </span>
              <span class="member-row-meta">
                ${expiryBadge(m.expiresAt)}
                ${m.paid ? "" : `<span class="pill red">미납</span>`}
              </span>
            </button>
          `).join("") : `<p class="panel-empty">조건에 맞는 회원이 없습니다.</p>`}
        </div>
      </div>

      ${selected ? memberPanel(selected) : `<div class="card pad"><p class="panel-empty">회원을 선택해 주세요.</p></div>`}
    </section>
  `);
}

function memberPanel(m) {
  const history = state.bookings.filter((b) => b.memberId === m.id);
  const guestTotal = history.reduce((sum, b) => sum + b.guests, 0);
  const sent = state.messages.filter((x) => x.memberId === m.id);
  return `
    <div class="card pad member-detail">
      <div class="member-detail-head">
        <div>
          <h2>${m.name}</h2>
          <p class="member-detail-sub">${m.phone}</p>
        </div>
        <span class="pill ${m.grade === "VVIP" ? "gold" : ""}">${m.grade}</span>
      </div>

      <dl class="spec-list">
        <div><dt>가입일</dt><dd>${formatDate(m.joinedAt)}</dd></div>
        <div><dt>연회비 만료</dt><dd>${formatDate(m.expiresAt)} ${expiryBadge(m.expiresAt)}</dd></div>
        <div><dt>납부 상태</dt><dd>${m.paid ? `<span class="pill green">납부</span>` : `<span class="pill red">미납</span>`}</dd></div>
        <div><dt>이용 횟수</dt><dd>${history.length}회 · 누적 게스트 ${guestTotal}명 (${won(guestTotal * 10000)})</dd></div>
      </dl>

      <div class="member-actions">
        <button class="mini-btn ${m.paid ? "" : "green"}" onclick="togglePaid(${m.id})">${icon("money")}${m.paid ? "미납으로 변경" : "입금 확인됨"}</button>
        <button class="mini-btn primary" onclick="sendManual(${m.id}, '만료 안내')">${icon("phone")}만료 안내 문자</button>
      </div>

      <div class="member-block">
        <h3>메모</h3>
        <textarea class="memo-box" placeholder="응대 시 참고할 내용을 적어 두세요"
                  oninput="updateMemo(${m.id}, this.value)">${m.memo || ""}</textarea>
      </div>

      <div class="member-block">
        <h3>이용 내역</h3>
        ${history.length ? history
          .slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((b) => `<div class="row"><span>${formatDate(b.date)} · ${b.time}</span><strong>게스트 ${b.guests}명</strong></div>`)
          .join("") : `<p class="panel-empty">이용 내역이 없습니다.</p>`}
      </div>

      <div class="member-block">
        <h3>보낸 문자</h3>
        ${sent.length ? sent
          .map((x) => `<div class="row"><span>${formatDate(x.sentAt)} · ${x.kind}</span><strong>${x.auto ? "자동" : "수동"}</strong></div>`)
          .join("") : `<p class="panel-empty">보낸 문자가 없습니다.</p>`}
      </div>
    </div>
  `;
}

function adminMessages() {
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>문자 발송</h1>
        <p>아래 상황에서는 문자가 자동으로 나갑니다. 직접 보내실 수도 있습니다.</p>
      </div>
    </div>

    <section class="grid two">
      <div class="card pad">
        <h3>자동 발송 규칙</h3>
        <dl class="spec-list">
          <div><dt>가입 승인</dt><dd>승인 버튼을 누른 즉시</dd></div>
          <div><dt>연회비 만료 안내</dt><dd>만료 30일 전 · 7일 전</dd></div>
          <div><dt>예약 확정</dt><dd>확정 버튼을 누른 즉시</dd></div>
        </dl>
        <p class="panel-note" style="margin-top:14px;">
          실제 서비스에서는 카카오 알림톡으로 보내고, 실패하면 문자로 다시 보냅니다.
        </p>
      </div>

      <div class="card pad">
        <h3>발송 집계</h3>
        <div class="row"><span>자동 발송</span><strong>${state.messages.filter((m) => m.auto).length}건</strong></div>
        <div class="row"><span>직접 발송</span><strong>${state.messages.filter((m) => !m.auto).length}건</strong></div>
        <div class="row"><span>합계</span><strong>${state.messages.length}건</strong></div>
      </div>
    </section>

    <section class="card table-wrap" style="margin-top:14px;">
      <table>
        <thead><tr><th>보낸 날짜</th><th>받는 분</th><th>연락처</th><th>종류</th><th>방식</th><th>내용</th></tr></thead>
        <tbody>
          ${state.messages.map((m) => `
            <tr>
              <td>${formatDate(m.sentAt)}</td>
              <td>${m.name}</td>
              <td>${m.phone}</td>
              <td><span class="pill ${m.kind === "가입 승인" ? "green" : m.kind === "만료 안내" ? "gold" : ""}">${m.kind}</span></td>
              <td>${m.auto ? "자동" : "직접"}</td>
              <td class="msg-text">${m.text}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `);
}

function selectMember(id) {
  state.selectedMemberId = id;
  if (state.route !== "admin-members") state.route = "admin-members";
  render();
}

function setMemberFilter(key, value) {
  state.memberFilter[key] = value;
  render();
}

function updateMemo(id, value) {
  const m = state.members.find((x) => x.id === id);
  if (m) m.memo = value; // 입력 중에는 다시 그리지 않는다 (커서가 튄다)
}

function togglePaid(id) {
  const m = state.members.find((x) => x.id === id);
  if (!m) return;
  m.paid = !m.paid;
  render();
}

function sendManual(id, kind) {
  const m = state.members.find((x) => x.id === id);
  if (!m) return;
  const text = kind === "만료 안내"
    ? `${m.name}님의 ${m.grade} 회원 기간이 ${formatDate(m.expiresAt)} 만료됩니다. 연회비 안내드립니다.`
    : `${m.name}님께 안내드립니다.`;
  logMessage(m, kind, text, false);
  render();
}

function confirmBooking(id) {
  const b = state.bookings.find((x) => x.id === id);
  if (!b) return;
  b.status = "확정";
  const m = state.members.find((x) => x.id === b.memberId);
  if (m) {
    logMessage(m, "예약 확정", `${m.name}님의 예약이 확정되었습니다. ${formatDate(b.date)} ${b.time}`, true);
  }
  render();
}

function adminApprovals() {
  return shell("admin", adminTableView("가입 승인", "승인하면 신청자에게 문자가 자동으로 발송됩니다.", `
    <table>
      <thead><tr><th>이름</th><th>연락처</th><th>희망 등급</th><th>관심 분야</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>
        ${state.applications.map((item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td><span class="pill ${item.grade === "VVIP" ? "gold" : ""}">${item.grade}</span></td>
            <td>${item.interests}</td>
            <td><span class="pill ${item.status === "승인" ? "green" : item.status === "반려" ? "red" : "gold"}">${item.status}</span></td>
            <td>
              ${item.status === "대기" ? `
                <div class="table-actions">
                  <button class="mini-btn green" onclick="approveApplication(${item.id})">${icon("check")}승인</button>
                  <button class="mini-btn danger" onclick="rejectApplication(${item.id})">${icon("x")}반려</button>
                </div>` : `<span class="sent-no">처리 완료</span>`}
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
        <h1>회원 등록</h1>
        <p>전화나 현장에서 접수한 회원을 직접 등록합니다. 등록하면 명단에 바로 들어갑니다.</p>
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
        <h3>최근 등록된 회원</h3>
        ${state.members.slice(0, 6).map((item) => `
          <div class="row">
            <span>${item.name} · ${item.phone}</span>
            <strong>${item.grade}</strong>
          </div>
        `).join("")}
      </div>
    </section>
  `);
}

function adminBookings() {
  return shell("admin", adminTableView("예약 현황", "확정하면 회원에게 문자가 자동으로 발송됩니다.", `
    <table>
      <thead><tr><th>회원</th><th>날짜</th><th>시간</th><th>게스트</th><th>게스트 이용료</th><th>상태</th><th>처리</th></tr></thead>
      <tbody>
        ${state.bookings
          .slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((item) => `
          <tr>
            <td>${item.member}</td>
            <td>${formatDate(item.date)}</td>
            <td>${item.time}</td>
            <td>${item.guests}명</td>
            <td>${item.guests ? won(item.guests * 10000) : "-"}</td>
            <td><span class="pill ${item.status === "확정" ? "green" : item.status === "신청" ? "gold" : ""}">${item.status}</span></td>
            <td>
              <div class="table-actions">
                ${item.status === "신청" ? `<button class="mini-btn green" onclick="confirmBooking(${item.id})">${icon("check")}확정</button>` : ""}
                ${item.status !== "완료" ? `<button class="mini-btn" onclick="const b=state.bookings.find(x=>x.id===${item.id});b.status='완료';render();">${icon("check")}완료</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `));
}

function adminSettlement() {
  const rows = state.bookings.filter((b) => b.guests > 0);
  const totalGuests = rows.reduce((sum, item) => sum + item.guests, 0);
  const total = totalGuests * 10000;
  return shell("admin", `
    <div class="view-title">
      <div>
        <p class="section-label">ADMIN</p>
        <h1>게스트 정산</h1>
        <p>게스트 이용료는 1인당 10,000원입니다. 예약에 입력된 인원으로 자동 계산됩니다.</p>
      </div>
    </div>
    <section class="grid two">
      <div class="dash-hero">
        <p class="eyebrow">TOTAL</p>
        <h1>${won(total)}</h1>
        <p style="color:rgba(255,255,255,.72);">게스트 ${totalGuests}명 · ${rows.length}건</p>
      </div>
      <div class="card pad">
        <h3>건별 내역</h3>
        ${rows.length ? rows
          .slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((item) => `
            <div class="row">
              <span>${formatDate(item.date)} · ${item.member} · ${item.guests}명</span>
              <strong>${won(item.guests * 10000)}</strong>
            </div>
          `).join("") : `<p class="panel-empty">게스트 동반 내역이 없습니다.</p>`}
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
    "admin-payments": adminPayments,
    "admin-members": adminMembers,
    "admin-approvals": adminApprovals,
    "admin-bookings": adminBookings,
    "admin-messages": adminMessages,
    "admin-register": adminRegister,
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
  selectMember,
  setMemberFilter,
  updateMemo,
  togglePaid,
  sendManual,
  confirmBooking,
  confirmPayment,
  sendPaymentReminder,
  cancelUnpaid,
  cancelAllOverdue,
  render,
});

render();

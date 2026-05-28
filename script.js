var BOOKMARKS_KEY = 'rf4_fish_bookmarks';
var BOSS_MAP_ID = '16';
var ENC_PAGE_SIZE = 30;
var MAP_PAGE = 0;
var GUIDE_PAGE = 1;
var ENCYCLOPEDIA_PAGE = 2;
var BOOKMARK_PAGE = 3;

var MAP_CARD_IMAGE_MAP = {
  '1': 'assets/map-1.png',
  '2': 'assets/map-2.png',
  '3': 'assets/map-3.png',
  '5': 'assets/map-5.png',
  '12': 'assets/map-12.png',
  '16': 'assets/map-16.png',
  '18': 'assets/map-18.png',
  '20': 'assets/map-20.png',
  '22': 'assets/map-22.png',
  '24': 'assets/map-24.png',
  '26': 'assets/map-26.png',
  '27': 'assets/map-27.png',
  '27b': 'assets/map-27b.png',
  '28': 'assets/map-28.png',
  '29': 'assets/map-29.png',
  '30': 'https://oss.rf4db.com/mp/maps/14.jpeg',
  '31': 'assets/map-31.png',
  '32': 'assets/map-32.png'
};

var MAP_TAGLINES = {
  '1': '新手村',
  '2': '宁静湖泊',
  '3': '蜿蜒河流',
  '12': '老奥',
  '5': '鲤鱼天堂',
  '16': '\u7ec8\u6781\u6d77\u56fe',
  '18': '熊湖',
  '20': '大河湍流',
  '22': '丰富鱼种',
  '24': '底钓圣地',
  '26': '欧洲大湖',
  '27': '神秘湖泊',
  '27b': '船钓区域',
  '28': '大型鱼类',
  '29': '工业风湖泊',
  '30': '原始自然',
  '31': '亚马河全景',
  '32': '终极挑战'
};

var MAP_DECOR_ICONS = {
  '1': 'map',
  '2': 'coordinate',
  '3': 'fish',
  '12': 'star',
  '5': 'fish',
  '16': 'boss',
  '18': 'fish',
  '20': 'coordinate',
  '22': 'fish',
  '24': 'gear',
  '26': 'coordinate',
  '27': 'map',
  '27b': 'rod',
  '28': 'fish',
  '29': 'gear',
  '30': 'level',
  '31': 'fish',
  '32': 'boss'
};

var FISH_IMAGE_NAME_MAP = {
  '丁桂': '丁鱥',
  '三红': '北极红点鲑',
  '三花鱼': '三花鲤鱼',
  '东鲟': '东西伯利亚鲟',
  '亚速鱼': '亚速海拟鲤',
  '各种鲑鱼': '拉多加鲑',
  '库图鱼': '库图拟鲤',
  '库红北极': '廓里湖红点鲑',
  '杜父鱼': '西伯利亚杜父鱼',
  '欧泊': '拟鲤',
  '波罗鱼': '波罗的海鲟鱼',
  '泥鳅': '泥鳅鱼',
  '狗鱼': '常见狗鱼',
  '银鲷': '银鲷鱼',
  '长体西鲱': '长体西鯡',
  '鲑鱼': '大西洋鲑鱼',
  '鲟鱼': '俄罗斯鲟',
  '鲤鱼': '普通鲤鱼',
  '鳑鲏': '河鲫鱼',
  '黄金丁丁': '金丁鱥'
};

var currentNav = MAP_PAGE;
var currentMap = (typeof MAP_ORDER !== 'undefined' && MAP_ORDER[0]) ? MAP_ORDER[0] : '1';
var currentModalFish = null;
var encCurrentMap = 'all';
var encSearch = '';
var encCurrentPage = 1;
var mapSearchQuery = '';
var mapStageIndex = 0;
var mapStageDirection = 0;
var mapStageLocked = false;
var guideFishSearch = '';
var fishBookmarks = loadBookmarks();

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeInlineJsString(value) {
  return escapeHtml(String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, ' '));
}

function lower(value) {
  return String(value == null ? '' : value).toLowerCase();
}

function getMapIds() {
  return typeof MAP_ORDER === 'undefined' ? [] : MAP_ORDER.slice();
}

function getMapCardOrder() {
  var preferred = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '18', '19', '17'];
  var ids = getMapIds();
  var ordered = preferred.filter(function (id) { return ids.indexOf(id) !== -1; });
  ids.forEach(function (id) {
    if (ordered.indexOf(id) === -1) ordered.push(id);
  });
  return ordered;
}

function getMapInfo(mapId) {
  if (typeof MAP_INFO === 'undefined' || !MAP_INFO[mapId]) {
    return { name: mapId, desc: '暂无描述', diff: 0, rec: 0, equip: [] };
  }
  return MAP_INFO[mapId];
}

function getMapFish(mapId) {
  if (typeof DATABASE === 'undefined') return [];
  return DATABASE.filter(function (fish) { return fish.map === mapId; });
}

function getPrimarySpot(fish) {
  return fish && fish.spots && fish.spots.length ? fish.spots[0] : null;
}

function getMapImage(mapId) {
  if (typeof MAP_IMAGES !== 'undefined' && MAP_IMAGES[mapId]) return MAP_IMAGES[mapId];
  return MAP_CARD_IMAGE_MAP[mapId] || '';
}

function getFishCode(name) {
  if (typeof FISH_CODES === 'undefined') return '';
  return FISH_CODES[name] || '';
}

function getNormalizedFishImageName(name, alias) {
  var candidates = [];
  if (name) candidates.push(name);
  if (alias) {
    String(alias).split(/[\/／]/).forEach(function (part) {
      var value = part.trim();
      if (value) candidates.push(value);
    });
  }

  for (var i = 0; i < candidates.length; i += 1) {
    var candidate = candidates[i];
    if (getFishCode(candidate)) return candidate;
    if (FISH_IMAGE_NAME_MAP[candidate] && getFishCode(FISH_IMAGE_NAME_MAP[candidate])) {
      return FISH_IMAGE_NAME_MAP[candidate];
    }
  }

  for (var j = 0; j < candidates.length; j += 1) {
    var fallback = candidates[j];
    if (FISH_IMAGE_NAME_MAP[fallback]) return FISH_IMAGE_NAME_MAP[fallback];
  }

  return name || '';
}

function getFishImage(name, alias) {
  var normalizedName = getNormalizedFishImageName(name, alias);
  if (typeof FISH_IMAGES !== 'undefined' && FISH_IMAGES[normalizedName]) {
    return FISH_IMAGES[normalizedName];
  }
  if (typeof FISH_IMAGES !== 'undefined' && FISH_IMAGES[name]) {
    return FISH_IMAGES[name];
  }
  var code = getFishCode(normalizedName);
  return code ? 'https://cn.rf4-stat.ru/images/rf4game/' + code + '.png' : '';
}

var UI_ICON_PATHS = {
  map: '<path d="M6 9l9-4 9 4 9-4 9 4v30l-9-4-9 4-9-4-9 4V9z"></path><path d="M15 5v30M24 9v30M33 5v30"></path>',
  guide: '<path d="M12 9h18l6 6v24H12V9z"></path><path d="M30 9v8h8"></path><path d="M18 22h14M18 29h12M18 36h8"></path>',
  encyclopedia: '<path d="M11 8h16a7 7 0 0 1 7 7v25H18a7 7 0 0 0-7 7V8z"></path><path d="M34 15h4v25H18"></path><path d="M17 17h10M17 24h10M17 31h8"></path>',
  bookmark: '<path d="M15 7h18a3 3 0 0 1 3 3v31l-12-7-12 7V10a3 3 0 0 1 3-3z"></path><path d="M19 16h10"></path>',
  search: '<circle cx="21" cy="21" r="10"></circle><path d="M29 29l10 10"></path>',
  back: '<path d="M28 12L16 24l12 12"></path><path d="M17 24h24"></path>',
  open: '<path d="M16 10h22v22"></path><path d="M38 10L14 34"></path><path d="M12 18v20h20"></path>',
  copy: '<path d="M16 16h20v24H16z"></path><path d="M12 32H8V8h20v4"></path>',
  close: '<path d="M14 14l20 20M34 14L14 34"></path>',
  clear: '<path d="M13 18h22"></path><path d="M18 18v20h12V18"></path><path d="M20 14h8"></path>',
  up: '<path d="M24 10v28"></path><path d="M13 21l11-11 11 11"></path>',
  down: '<path d="M24 38V10"></path><path d="M13 27l11 11 11-11"></path>',
  fish: '<path d="M5 24c7-9 21-12 31 0-10 12-24 9-31 0z"></path><path d="M36 24l8-7v14l-8-7z"></path><circle cx="14" cy="22" r="1.7"></circle><path d="M20 28c4 2 8 2 12-1"></path>',
  hook: '<path d="M27 7v23a9 9 0 1 1-14-7"></path><path d="M22 7h10"></path><path d="M27 30c0 5 6 5 6 0"></path>',
  rod: '<path d="M9 39L38 10"></path><path d="M31 17c7 1 10 5 9 12"></path><path d="M18 30l6 6"></path><circle cx="27" cy="21" r="2"></circle>',
  bait: '<path d="M12 30c0-10 8-17 19-20 2 11-2 21-12 25"></path><path d="M17 34c3 3 8 3 11-1"></path><path d="M18 22c5 0 9 3 11 8"></path>',
  depth: '<path d="M24 7v34"></path><path d="M15 16h18M17 25h14M19 34h10"></path><path d="M12 41h24"></path>',
  clock: '<circle cx="24" cy="24" r="16"></circle><path d="M24 14v11l8 5"></path>',
  coordinate: '<path d="M24 43s14-13 14-25A14 14 0 1 0 10 18c0 12 14 25 14 25z"></path><circle cx="24" cy="18" r="4"></circle>',
  gear: '<path d="M24 14v-5M24 39v-5M14 24H9M39 24h-5M16.9 16.9l-3.5-3.5M34.6 34.6l-3.5-3.5M31.1 16.9l3.5-3.5M13.4 34.6l3.5-3.5"></path><circle cx="24" cy="24" r="8"></circle><circle cx="24" cy="24" r="3"></circle>',
  star: '<path d="M24 8l4.8 10 11 .8-8.2 7.2 2.6 10.8L24 31l-10.2 5.8L16.4 26 8.2 18.8l11-.8L24 8z"></path>',
  starFilled: '<path class="ui-icon-fill" d="M24 8l4.8 10 11 .8-8.2 7.2 2.6 10.8L24 31l-10.2 5.8L16.4 26 8.2 18.8l11-.8L24 8z"></path>',
  boss: '<path d="M10 16l8 7 6-13 6 13 8-7-3 22H13l-3-22z"></path><path d="M16 31h16"></path>',
  level: '<path d="M24 7l15 8v10c0 10-6 16-15 19-9-3-15-9-15-19V15l15-8z"></path><path d="M17 25l5 5 10-12"></path>'
};

function getUiIconSvg(name) {
  var path = UI_ICON_PATHS[name] || UI_ICON_PATHS.gear;
  return '<svg class="ui-icon-svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" xmlns="http://www.w3.org/2000/svg">' + path + '</svg>';
}

function getUiIcon(name, className) {
  return '<span class="' + escapeHtml(className || 'ui-icon') + '" aria-hidden="true">' + getUiIconSvg(name) + '</span>';
}

function hydrateUiIcons(root) {
  var scope = root || document;
  scope.querySelectorAll('[data-ui-icon]').forEach(function (target) {
    target.innerHTML = getUiIconSvg(target.getAttribute('data-ui-icon'));
  });
}

function getEquipmentIconName(equip) {
  var text = lower(((equip && equip.name) || '') + ' ' + ((equip && equip.tag) || ''));
  if (text.indexOf('rod') !== -1 || text.indexOf('竿') !== -1 || text.indexOf('杆') !== -1) return 'rod';
  if (text.indexOf('hook') !== -1 || text.indexOf('钩') !== -1) return 'hook';
  if (text.indexOf('bait') !== -1 || text.indexOf('饵') !== -1 || text.indexOf('诱') !== -1) return 'bait';
  return 'gear';
}

function getFishFallbackSvg() {
  return '' +
    '<span class="fish-icon-svg ui-icon-frame ui-icon-frame-fish" aria-hidden="true">' +
      getUiIconSvg('fish') +
    '</span>';
}

function getRatingLabel(value) {
  return 'Lv.' + String(value || 0);
}

function getMapLevel(mapId) {
  var info = getMapInfo(mapId);
  return Number(info.level || 0);
}

function getMapLevelLabel(mapId) {
  return 'Lv.' + String(getMapLevel(mapId));
}

function getRecommendationLabel(value) {
  return '推荐 ' + String(value || 0) + '/5';
}

function getTagline(mapId) {
  return MAP_TAGLINES[mapId] || '地图资料';
}

function getDecorIcon(mapId) {
  return MAP_DECOR_ICONS[mapId] || 'map';
}

function isBossMap(mapId) {
  return mapId === BOSS_MAP_ID || !!getMapInfo(mapId).boss;
}

function isWideMap(mapId) {
  return mapId === '27b';
}

function getTierClass(mapId) {
  if (isBossMap(mapId)) return ' tier-gold';
  var diff = getMapInfo(mapId).diff || 0;
  if (diff <= 2) return ' tier-green';
  if (diff === 3) return ' tier-blue';
  if (diff === 4) return ' tier-cyan';
  return ' tier-purple';
}

function getUniqueFishCount() {
  if (typeof DATABASE === 'undefined') return 0;
  var cache = {};
  DATABASE.forEach(function (fish) { cache[fish.name] = true; });
  return Object.keys(cache).length;
}

function getMostCommonTime(list) {
  var counts = {};
  var best = '全天';
  var bestCount = 0;
  list.forEach(function (item) {
    var key = item || '全天';
    counts[key] = (counts[key] || 0) + 1;
    if (counts[key] > bestCount) {
      best = key;
      bestCount = counts[key];
    }
  });
  return best;
}

function loadBookmarks() {
  try {
    var raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveBookmarks() {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(fishBookmarks));
  } catch (error) {
    return;
  }
}

function getBookmarkKey(fish) {
  return fish && fish.map && fish.name ? fish.map + '::' + fish.name : '';
}

function parseBookmarkKey(key) {
  var meta = fishBookmarks[key] || {};
  var marker = String(key || '').indexOf('::');
  if (marker !== -1) {
    return {
      map: key.slice(0, marker),
      name: key.slice(marker + 2),
      meta: meta
    };
  }
  return {
    map: meta.map || '',
    name: meta.name || key,
    meta: meta
  };
}

function isBookmarked(fish) {
  var key = getBookmarkKey(fish);
  if (key && Object.prototype.hasOwnProperty.call(fishBookmarks, key)) return true;
  return !!(fish && fish.name && Object.prototype.hasOwnProperty.call(fishBookmarks, fish.name));
}

function focusMapSearch() {
  var candidates = [];
  if (currentNav === MAP_PAGE) candidates.push('mapSearch');
  if (currentNav === GUIDE_PAGE) candidates.push('guideFishSearch');
  if (currentNav === ENCYCLOPEDIA_PAGE) candidates.push('encSearch');
  candidates.push('mapSearch', 'guideFishSearch', 'encSearch');

  var input = null;
  candidates.some(function (id) {
    var target = byId(id);
    if (target) {
      input = target;
      return true;
    }
    return false;
  });
  if (input) input.focus();
}

function clearMapSearch() {
  mapSearchQuery = '';
  mapStageIndex = 0;
  mapStageDirection = 0;
  if (byId('mapSearch')) byId('mapSearch').value = '';
  buildMapGrid();
  focusMapSearch();
}

function clearGuideFishSearch() {
  guideFishSearch = '';
  if (byId('guideFishSearch')) byId('guideFishSearch').value = '';
  updateGuidePage();
  focusMapSearch();
}

function clearEncyclopediaFilters() {
  encSearch = '';
  encCurrentMap = 'all';
  encCurrentPage = 1;
  if (byId('encSearch')) byId('encSearch').value = '';
  buildEncyclopediaTabs();
  buildEncyclopediaGrid();
  focusMapSearch();
}

function getGuideFilteredFish(mapId) {
  var query = lower(guideFishSearch);
  var fish = getMapFish(mapId);
  if (!query) return fish;
  return fish.filter(function (entry) {
    return lower(entry.name).indexOf(query) !== -1 ||
      lower(entry.alias).indexOf(query) !== -1 ||
      lower(entry.bait).indexOf(query) !== -1;
  });
}

function formatSavedTime(timestamp) {
  if (!timestamp) return '较早收藏';
  var diff = Date.now() - timestamp;
  if (diff < 60 * 1000) return '刚刚收藏';
  if (diff < 60 * 60 * 1000) return Math.max(1, Math.floor(diff / (60 * 1000))) + ' 分钟前';
  if (diff < 24 * 60 * 60 * 1000) return Math.max(1, Math.floor(diff / (60 * 60 * 1000))) + ' 小时前';
  return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000))) + ' 天前';
}

function fallbackCopyText(text) {
  try {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    area.style.pointerEvents = 'none';
    document.body.appendChild(area);
    area.focus();
    area.select();
    var copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  } catch (error) {
    return false;
  }
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(function () {
      return true;
    }).catch(function () {
      return fallbackCopyText(text);
    });
  }
  return Promise.resolve(fallbackCopyText(text));
}

function showToast(message, tone) {
  var stack = byId('toastStack');
  if (!stack) return;

  var iconName = tone === 'success' ? 'starFilled' : (tone === 'warn' ? 'boss' : 'level');
  var toast = document.createElement('div');
  toast.className = 'toast' + (tone ? ' ' + tone : '');
  toast.innerHTML = getUiIcon(iconName, 'toast-icon ui-icon') + '<span>' + escapeHtml(message) + '</span>';
  stack.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('show');
  });

  setTimeout(function () {
    toast.classList.remove('show');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }, 2200);
}

function isTypingElement(element) {
  if (!element) return false;
  if (element.isContentEditable) return true;
  var tagName = element.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

function updateSummaryStats() {
  if (byId('heroMapCount')) byId('heroMapCount').textContent = getMapIds().length;
  if (byId('heroFishCount')) byId('heroFishCount').textContent = getUniqueFishCount();
  if (byId('heroBookmarkCount')) byId('heroBookmarkCount').textContent = Object.keys(fishBookmarks).length;
  if (byId('bookmarkTotal')) byId('bookmarkTotal').textContent = Object.keys(fishBookmarks).length;
}

function getFilteredMapCards() {
  var query = lower(mapSearchQuery);
  return getMapCardOrder().filter(function (mapId) {
    if (!query) return true;
    var info = getMapInfo(mapId);
    return lower(info.name).indexOf(query) !== -1 ||
      lower(info.desc).indexOf(query) !== -1 ||
      lower(getTagline(mapId)).indexOf(query) !== -1;
  });
}

function setCurrentMapFromStage(cards) {
  if (!cards.length) return;
  mapStageIndex = Math.max(0, Math.min(mapStageIndex, cards.length - 1));
  currentMap = cards[mapStageIndex];
}

function bindMapSearchInput() {
  var input = byId('mapSearch');
  if (!input) return;
  input.addEventListener('input', function () {
    mapSearchQuery = this.value.trim();
    mapStageIndex = 0;
    mapStageDirection = 0;
    buildMapGrid();
    focusMapSearch();
    var focusedInput = byId('mapSearch');
    if (focusedInput && focusedInput.setSelectionRange) {
      focusedInput.setSelectionRange(focusedInput.value.length, focusedInput.value.length);
    }
  });
}

function moveMapStage(delta) {
  if (currentNav !== MAP_PAGE || mapStageLocked) return;
  var cards = getFilteredMapCards();
  if (cards.length <= 1) return;
  var nextIndex = (mapStageIndex + delta + cards.length) % cards.length;
  if (nextIndex === mapStageIndex) return;
  mapStageDirection = delta > 0 ? 1 : -1;
  mapStageIndex = nextIndex;
  mapStageLocked = true;
  buildMapGrid();
  window.setTimeout(function () {
    mapStageLocked = false;
  }, 520);
}

function buildMapGrid() {
  var grid = byId('mapGrid');
  if (!grid) return;

  var cards = getFilteredMapCards();
  if (!cards.length) {
    currentMap = '';
    grid.innerHTML = '' +
      '<div class="map-stage-empty">' +
        '<label class="map-stage-search" aria-label="&#25628;&#32034;&#22320;&#22270;">' +
          '<input id="mapSearch" type="text" value="' + escapeHtml(mapSearchQuery) + '" placeholder="&#25628;&#32034;&#22320;&#22270; / &#28023;&#22270;">' +
          getUiIcon('search', 'hero-search-icon ui-icon-muted') +
        '</label>' +
        '<div class="empty-state empty-state-full">' +
          '<div class="empty-state-title">&#27809;&#26377;&#21305;&#37197;&#22320;&#22270;</div>' +
          '<div class="empty-state-text">&#25442;&#20010;&#20851;&#38190;&#35789;&#35797;&#35797;&#65292;&#25110;&#28165;&#31354;&#25628;&#32034;&#24674;&#22797;&#20840;&#37096;&#22320;&#22270;&#12290;</div>' +
          '<div class="empty-state-actions">' +
            '<button class="section-btn" type="button" onclick="clearMapSearch()">&#28165;&#31354;&#25628;&#32034;</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    bindMapSearchInput();
    return;
  }

  setCurrentMapFromStage(cards);
  var mapId = currentMap;
  var info = getMapInfo(mapId);
  var fish = getMapFish(mapId);
  var image = getMapImage(mapId);
  var bgStyle = image ? ' style="background-image:url(\'' + image.replace(/'/g, '%27') + '\')"' : '';
  var bossBadge = isBossMap(mapId) ? '<span class="map-stage-badge accent">&#32456;&#26497;&#28023;&#22270;</span>' : '';
  var directionClass = mapStageDirection < 0 ? ' from-up' : (mapStageDirection > 0 ? ' from-down' : '');
  var progress = cards.length ? Math.round(((mapStageIndex + 1) / cards.length) * 100) : 0;
  var countText = fish.length + ' \u79cd\u9c7c';
  var recText = getRecommendationLabel(info.rec || 0);
  var levelText = getMapLevelLabel(mapId);
  var descText = info.desc || '\u5730\u56fe\u8d44\u6599';

  grid.innerHTML = '' +
    '<article class="map-stage-card' + directionClass + '" data-map-id="' + escapeHtml(mapId) + '">' +
      '<button class="map-stage-bg" type="button" aria-label="&#25171;&#24320;' + escapeHtml(info.name) + '&#25915;&#30053;" onclick="openMapGuide(\'' + mapId + '\')">' +
        '<span class="map-stage-image"' + bgStyle + '></span>' +
        '<span class="map-stage-shade"></span>' +
      '</button>' +
      '<label class="map-stage-search" aria-label="&#25628;&#32034;&#22320;&#22270;">' +
        '<input id="mapSearch" type="text" value="' + escapeHtml(mapSearchQuery) + '" placeholder="&#25628;&#32034;&#22320;&#22270; / &#28023;&#22270;">' +
        getUiIcon('search', 'hero-search-icon ui-icon-muted') +
      '</label>' +
      '<div class="map-stage-panel">' +
        '<div class="map-stage-kicker">' + escapeHtml(mapStageIndex + 1) + ' / ' + escapeHtml(cards.length) + '</div>' +
        '<h1 class="map-stage-title">' + escapeHtml(info.name) + '</h1>' +
        '<p class="map-stage-subtitle">' + escapeHtml(descText) + '</p>' +
        '<div class="map-stage-meta">' +
          '<span class="map-stage-badge">' + escapeHtml(levelText) + '</span>' +
          '<span class="map-stage-badge">' + escapeHtml(countText) + '</span>' +
          '<span class="map-stage-badge">' + escapeHtml(recText) + '</span>' +
          bossBadge +
        '</div>' +
        '<div class="map-stage-actions">' +
          '<button class="map-stage-primary" type="button" onclick="openMapGuide(\'' + mapId + '\')">&#26597;&#30475;&#25915;&#30053;</button>' +
          '<span class="map-stage-hint">&#28378;&#36718;&#19978;&#19979;&#20999;&#25442;&#22320;&#22270;</span>' +
        '</div>' +
      '</div>' +
      '<div class="map-stage-progress" aria-hidden="true"><span style="height:' + progress + '%"></span></div>' +
      '<button class="map-stage-nav prev" type="button" aria-label="&#19978;&#19968;&#24352;&#22320;&#22270;" onclick="moveMapStage(-1)"' + (cards.length <= 1 ? ' disabled' : '') + '>' + getUiIcon('up', 'ui-icon') + '</button>' +
      '<button class="map-stage-nav next" type="button" aria-label="&#19979;&#19968;&#24352;&#22320;&#22270;" onclick="moveMapStage(1)"' + (cards.length <= 1 ? ' disabled' : '') + '>' + getUiIcon('down', 'ui-icon') + '</button>' +
    '</article>';
  bindMapSearchInput();
}

function openMapGuide(mapId) {
  currentMap = mapId;
  guideFishSearch = '';
  if (byId('guideFishSearch')) byId('guideFishSearch').value = '';
  setNav(GUIDE_PAGE);
  updateGuidePage();
}

function updateGuidePage() {
  var info = getMapInfo(currentMap);
  var fish = getMapFish(currentMap);
  var filteredFish = getGuideFilteredFish(currentMap);
  var image = getMapImage(currentMap);
  var media = byId('guideHeroMedia');
  var allTimes = fish.map(function (entry) {
    return entry.spots.map(function (spot) { return spot.time; });
  }).reduce(function (all, group) { return all.concat(group); }, []);

  if (byId('guideTitle')) byId('guideTitle').textContent = info.name;
  if (byId('guideSubtitle')) byId('guideSubtitle').textContent = info.desc || '地图详情';
  if (media) {
    media.style.backgroundImage = image ? 'url("' + image.replace(/"/g, '%22') + '")' : '';
    media.classList.toggle('no-image', !image);
  }
  if (byId('guideHeroTitle')) byId('guideHeroTitle').textContent = info.name;
  if (byId('guideHeroDesc')) byId('guideHeroDesc').textContent = (isBossMap(currentMap) ? '终极大boss海图，挑战最高海域收益。' : (info.desc || '地图资料')) + ' · ' + getTagline(currentMap);
  if (byId('guideLevelBadge')) byId('guideLevelBadge').textContent = getMapLevelLabel(currentMap);
  if (byId('guideBossBadge')) byId('guideBossBadge').hidden = !isBossMap(currentMap);
  if (byId('guideDiff')) byId('guideDiff').textContent = String(info.diff || 0);
  if (byId('guideRec')) byId('guideRec').textContent = String(info.rec || 0);
  if (byId('guideFishTotal')) byId('guideFishTotal').textContent = fish.length;
  if (byId('guideBestTime')) byId('guideBestTime').textContent = getMostCommonTime(allTimes);
  if (byId('guideFishCount')) {
    byId('guideFishCount').textContent = filteredFish.length === fish.length ? (fish.length + ' 项') : (filteredFish.length + ' / ' + fish.length + ' 项');
  }

  var guideFishList = byId('guideFishList');
  if (guideFishList) {
    if (!filteredFish.length) {
      guideFishList.innerHTML = '' +
        '<div class="empty-state empty-state-compact">' +
          '<div class="empty-state-title">没有匹配的目标鱼</div>' +
          '<div class="empty-state-text">当前筛选没有结果，清空关键词后可恢复完整列表。</div>' +
          '<div class="empty-state-actions">' +
            '<button class="section-btn" type="button" onclick="clearGuideFishSearch()">清空筛选</button>' +
          '</div>' +
        '</div>';
    } else {
      guideFishList.innerHTML = filteredFish.map(function (entry) {
        var imageUrl = getFishImage(entry.name, entry.alias);
        var spot = getPrimarySpot(entry);
        var originalIndex = fish.indexOf(entry);
        return '' +
          '<button class="guide-fish-item" type="button" onclick="openFishModalByMapIndex(\'' + currentMap + '\',' + originalIndex + ')">' +
            '<span class="guide-fish-icon">' + (imageUrl ? '<img src="' + imageUrl + '" alt="' + escapeHtml(entry.name) + '" loading="lazy" onerror="this.parentElement.innerHTML=getFishFallbackSvg()">' : getFishFallbackSvg()) + '</span>' +
            '<span class="guide-fish-body">' +
              '<span class="guide-fish-row">' +
                '<span class="guide-fish-name">' + escapeHtml(entry.name) + '</span>' +
                '<span class="guide-fish-star' + (isBookmarked(entry) ? ' saved' : '') + '" onclick="event.stopPropagation();toggleBookmarkByMapIndex(\'' + currentMap + '\',' + originalIndex + ')">' + getUiIcon(isBookmarked(entry) ? 'starFilled' : 'star', 'ui-icon') + '</span>' +
              '</span>' +
              '<span class="guide-fish-meta">' + escapeHtml(entry.alias || '暂无别名') + '</span>' +
              '<span class="guide-fish-meta">' + escapeHtml(spot ? spot.time : '--') + ' · ' + escapeHtml(spot ? spot.depth : '--') + '</span>' +
            '</span>' +
          '</button>';
      }).join('');
    }
  }

  var equipList = byId('guideEquipList');
  if (equipList) {
    equipList.innerHTML = (info.equip || []).map(function (equip) {
      return '' +
        '<div class="guide-equip-item">' +
          '<span class="guide-equip-icon">' + getUiIcon(getEquipmentIconName(equip), 'ui-icon') + '</span>' +
          '<span class="guide-equip-copy">' +
            '<strong>' + escapeHtml(equip.name || '装备') + '</strong>' +
            '<span>' + escapeHtml(equip.tag || '推荐') + '</span>' +
          '</span>' +
        '</div>';
    }).join('');
  }

  var spotGrid = byId('guideSpotGrid');
  if (spotGrid) {
    if (!filteredFish.length) {
      spotGrid.innerHTML = '<div class="empty-state empty-state-compact empty-state-full"><div class="empty-state-text">当前筛选下没有可展示的钓点。</div></div>';
    } else {
      var spots = filteredFish.slice(0, 8).map(function (entry) {
        var spot = getPrimarySpot(entry);
        return '' +
          '<div class="guide-spot-item">' +
            '<div class="guide-spot-name">' + escapeHtml(entry.name) + '</div>' +
            '<div class="guide-spot-line">' + escapeHtml(spot ? spot.loc : '--') + '</div>' +
            '<div class="guide-spot-line">' + escapeHtml(spot ? spot.time : '--') + ' · ' + escapeHtml(spot ? spot.depth : '--') + '</div>' +
          '</div>';
      });
      spotGrid.innerHTML = spots.join('');
    }
  }
}

function setNav(index) {
  currentNav = index;
  document.querySelectorAll('.topnav-item').forEach(function (item, itemIndex) {
    item.classList.toggle('active', itemIndex === index);
  });

  var pageMap = {
    0: 'mapPage',
    1: 'guidePage',
    2: 'encyclopediaPage',
    3: 'bookmarkPage'
  };

  document.querySelectorAll('.page-section').forEach(function (section) {
    section.classList.remove('active');
  });

  var target = byId(pageMap[index] || 'mapPage');
  if (target) target.classList.add('active');

  if (index === GUIDE_PAGE) updateGuidePage();
  if (index === ENCYCLOPEDIA_PAGE) buildEncyclopediaGrid();
  if (index === BOOKMARK_PAGE) buildBookmarkGrid();
}

function buildEncyclopediaTabs() {
  var tabs = byId('encMapTabs');
  if (!tabs) return;

  var seen = {};
  var maps = ['all'];
  if (typeof FISH_ENCYCLOPEDIA !== 'undefined') {
    FISH_ENCYCLOPEDIA.forEach(function (entry) {
      if (entry.map && !seen[entry.map]) {
        seen[entry.map] = true;
        maps.push(entry.map);
      }
    });
  }

  tabs.innerHTML = maps.map(function (mapName) {
    var active = mapName === encCurrentMap ? ' active' : '';
    var label = mapName === 'all' ? '全部地图' : mapName;
    return '<button class="enc-map-tab' + active + '" type="button" onclick="setEncMap(\'' + escapeHtml(mapName) + '\')">' + escapeHtml(label) + '</button>';
  }).join('');
}

function getFilteredEncyclopediaItems() {
  if (typeof FISH_ENCYCLOPEDIA === 'undefined') return [];
  return FISH_ENCYCLOPEDIA.filter(function (entry) {
    if (encCurrentMap !== 'all' && entry.map !== encCurrentMap) return false;
    if (!encSearch) return true;
    return lower(entry.name).indexOf(lower(encSearch)) !== -1 || lower(entry.map).indexOf(lower(encSearch)) !== -1;
  });
}

function buildEncyclopediaGrid() {
  var grid = byId('encGrid');
  if (!grid) return;

  var list = getFilteredEncyclopediaItems();
  var totalPages = Math.max(1, Math.ceil(list.length / ENC_PAGE_SIZE));
  if (encCurrentPage > totalPages) encCurrentPage = totalPages;
  var start = (encCurrentPage - 1) * ENC_PAGE_SIZE;
  var pageItems = list.slice(start, start + ENC_PAGE_SIZE);

  if (byId('encTotal')) byId('encTotal').textContent = list.length;

  if (!pageItems.length) {
    grid.innerHTML = '' +
      '<div class="empty-state empty-state-full">' +
        '<div class="empty-state-title">没有匹配的百科条目</div>' +
        '<div class="empty-state-text">清空搜索词或重置地图筛选后，可恢复完整图鉴列表。</div>' +
        '<div class="empty-state-actions">' +
          '<button class="section-btn" type="button" onclick="clearEncyclopediaFilters()">重置筛选</button>' +
        '</div>' +
      '</div>';
    buildEncyclopediaPagination(totalPages);
    return;
  }

  grid.innerHTML = pageItems.map(function (entry) {
    var fish = findFishByName(entry.name, entry.map);
    var image = getFishImage(entry.name, fish ? fish.alias : '');
    return '' +
      '<button class="enc-fish-card" type="button" onclick="showEncDetailByName(\'' + escapeInlineJsString(entry.name) + '\', \'' + escapeInlineJsString(entry.map || '') + '\')">' +
        '<span class="enc-fish-img-wrap">' + (image ? '<img class="enc-fish-img" src="' + image + '" alt="' + escapeHtml(entry.name) + '" loading="lazy" onerror="this.parentElement.innerHTML=getFishFallbackSvg()">' : getFishFallbackSvg()) + '</span>' +
        '<span class="enc-fish-name">' + escapeHtml(entry.name) + '</span>' +
        '<span class="enc-fish-alias">' + escapeHtml(fish ? (fish.alias || '暂无别名') : '资料条目') + '</span>' +
        '<span class="enc-fish-stats">' +
          '<span class="enc-fish-weight">Max ' + escapeHtml(String(entry.max || '--')) + ' g</span>' +
          '<span class="enc-fish-weight">Avg ' + escapeHtml(String(entry.avg || '--')) + ' g</span>' +
        '</span>' +
        '<span class="enc-fish-map">' + escapeHtml(entry.map || '未知地图') + '</span>' +
      '</button>';
  }).join('');

  buildEncyclopediaPagination(totalPages);
}

function buildEncyclopediaPagination(totalPages) {
  var pagination = byId('encPagination');
  if (!pagination) return;
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  var html = '';
  html += '<button class="enc-page-btn" type="button"' + (encCurrentPage <= 1 ? ' disabled' : '') + ' onclick="setEncPage(' + (encCurrentPage - 1) + ')">‹</button>';
  for (var page = 1; page <= totalPages; page += 1) {
    if (page === 1 || page === totalPages || Math.abs(page - encCurrentPage) <= 1) {
      html += '<button class="enc-page-btn' + (page === encCurrentPage ? ' active' : '') + '" type="button" onclick="setEncPage(' + page + ')">' + page + '</button>';
    } else if (page === encCurrentPage - 2 || page === encCurrentPage + 2) {
      html += '<span class="enc-page-info">…</span>';
    }
  }
  html += '<button class="enc-page-btn" type="button"' + (encCurrentPage >= totalPages ? ' disabled' : '') + ' onclick="setEncPage(' + (encCurrentPage + 1) + ')">›</button>';
  pagination.innerHTML = html;
}

function setEncMap(mapName) {
  encCurrentMap = mapName;
  encCurrentPage = 1;
  buildEncyclopediaTabs();
  buildEncyclopediaGrid();
}

function setEncPage(page) {
  var totalPages = Math.max(1, Math.ceil(getFilteredEncyclopediaItems().length / ENC_PAGE_SIZE));
  encCurrentPage = Math.max(1, Math.min(totalPages, page));
  buildEncyclopediaGrid();
}

function findFishByName(name, mapName) {
  if (typeof DATABASE === 'undefined') return null;
  for (var i = 0; i < DATABASE.length; i += 1) {
    if (DATABASE[i].name === name && (!mapName || DATABASE[i].mapName === mapName)) return DATABASE[i];
  }
  return null;
}

function findFishByMapAndName(mapId, name) {
  if (typeof DATABASE === 'undefined' || !mapId) return null;
  for (var i = 0; i < DATABASE.length; i += 1) {
    if (DATABASE[i].map === String(mapId) && DATABASE[i].name === name) return DATABASE[i];
  }
  return null;
}

function showEncDetailByName(name, mapName) {
  if (typeof FISH_ENCYCLOPEDIA === 'undefined') return;
  var entry = FISH_ENCYCLOPEDIA.find(function (item) {
    return item.name === name && (!mapName || item.map === mapName);
  });
  if (!entry) return;

  var fish = findFishByName(name, entry.map);
  var image = getFishImage(name, fish ? fish.alias : '');

  if (byId('encDetailImg')) {
    byId('encDetailImg').innerHTML = image ? '<img class="enc-detail-figure" src="' + image + '" alt="' + escapeHtml(name) + '" loading="lazy" onerror="this.parentElement.innerHTML=getFishFallbackSvg()">' : getFishFallbackSvg();
  }
  if (byId('encDetailTitle')) byId('encDetailTitle').textContent = entry.name;
  if (byId('encDetailAlias')) byId('encDetailAlias').textContent = fish ? (fish.alias || '暂无别名') : '资料条目';
  if (byId('encDetailMap')) byId('encDetailMap').textContent = entry.map || '--';
  if (byId('encDetailMax')) byId('encDetailMax').textContent = (entry.max || '--') + ' g';
  if (byId('encDetailAvg')) byId('encDetailAvg').textContent = (entry.avg || '--') + ' g';
  if (byId('encDetailSpotCount')) byId('encDetailSpotCount').textContent = fish && fish.spots ? String(fish.spots.length) : '0';
  if (byId('encDetailModal')) byId('encDetailModal').classList.add('show');
}

function closeEncDetail() {
  if (byId('encDetailModal')) byId('encDetailModal').classList.remove('show');
}

function buildBookmarkGrid() {
  var grid = byId('bookmarkGrid');
  if (!grid) return;

  var keys = Object.keys(fishBookmarks).sort(function (left, right) {
    var leftTime = fishBookmarks[left] && fishBookmarks[left].savedAt ? fishBookmarks[left].savedAt : 0;
    var rightTime = fishBookmarks[right] && fishBookmarks[right].savedAt ? fishBookmarks[right].savedAt : 0;
    return rightTime - leftTime;
  });
  if (keys.length === 0) {
    grid.innerHTML = '' +
      '<div class="empty-state empty-state-full">' +
        '<div class="empty-state-title">还没有收藏鱼种</div>' +
        '<div class="empty-state-text">在地图攻略页给目标鱼打星，常刷鱼种就会集中到这里。</div>' +
        '<div class="empty-state-actions">' +
          '<button class="section-btn" type="button" onclick="setNav(0)">返回地图</button>' +
        '</div>' +
      '</div>';
    return;
  }

  grid.innerHTML = keys.map(function (key) {
    var parsed = parseBookmarkKey(key);
    var name = parsed.name;
    var bookmarkMeta = parsed.meta || {};
    var fish = findFishByMapAndName(parsed.map, name) || findFishByName(name);
    var image = getFishImage(name, fish ? fish.alias : (bookmarkMeta.alias || ''));
    var mapId = fish ? fish.map : (parsed.map || bookmarkMeta.map || '');
    var info = getMapInfo(mapId);
    return '' +
      '<button class="bookmark-card" type="button" onclick="openBookmarkedFish(\'' + escapeInlineJsString(key) + '\')">' +
        '<span class="bookmark-card-icon">' + (image ? '<img src="' + image + '" alt="' + escapeHtml(name) + '" loading="lazy" onerror="this.parentElement.innerHTML=getFishFallbackSvg()">' : getFishFallbackSvg()) + '</span>' +
        '<span class="bookmark-card-body">' +
          '<span class="bookmark-card-head">' +
            '<span class="bookmark-map-pill">' + escapeHtml(info.name || mapId || '未知地图') + '</span>' +
            '<span class="bookmark-saved-time">' + escapeHtml(formatSavedTime(bookmarkMeta.savedAt)) + '</span>' +
          '</span>' +
          '<span class="bookmark-card-name">' + escapeHtml(name) + '</span>' +
          '<span class="bookmark-card-meta">' + escapeHtml(fish ? (fish.alias || '暂无别名') : '暂无别名') + '</span>' +
          '<span class="bookmark-card-meta">主饵：' + escapeHtml(fish ? (fish.bait || '--') : (bookmarkMeta.bait || '--')) + '</span>' +
        '</span>' +
      '</button>';
  }).join('');
}

function openBookmarkedFish(key) {
  var parsed = parseBookmarkKey(key);
  var fish = findFishByMapAndName(parsed.map, parsed.name) || findFishByName(parsed.name);
  if (!fish) return;
  currentMap = fish.map;
  openMapGuide(currentMap);
  openFishModal(fish);
}

function toggleBookmarkByMapIndex(mapId, index) {
  var fish = getMapFish(mapId)[index];
  if (!fish) return;
  var key = getBookmarkKey(fish);
  if (isBookmarked(fish)) {
    delete fishBookmarks[key];
    delete fishBookmarks[fish.name];
    showToast('已取消收藏 ' + fish.name, 'info');
  } else {
    fishBookmarks[key] = {
      name: fish.name,
      map: fish.map,
      alias: fish.alias,
      bait: fish.bait,
      savedAt: Date.now()
    };
    showToast('已收藏 ' + fish.name, 'success');
  }
  saveBookmarks();
  updateSummaryStats();
  updateGuidePage();
  if (currentNav === BOOKMARK_PAGE) buildBookmarkGrid();
}

function openFishModalByMapIndex(mapId, index) {
  var fish = getMapFish(mapId)[index];
  if (!fish) return;
  openFishModal(fish);
}

function openFishModal(fish) {
  currentModalFish = fish;
  var image = getFishImage(fish.name, fish.alias);

  if (byId('modalFishImg')) {
    byId('modalFishImg').innerHTML = image ? '<img src="' + image + '" alt="' + escapeHtml(fish.name) + '" loading="lazy" onerror="this.parentElement.innerHTML=getFishFallbackSvg()">' : getFishFallbackSvg();
  }
  if (byId('modalFishName')) byId('modalFishName').textContent = fish.name;
  if (byId('modalFishAlias')) byId('modalFishAlias').textContent = fish.alias || '暂无别名';
  updateModalBookmarkBtn(fish);

  if (byId('modalSpots')) {
    byId('modalSpots').innerHTML = fish.spots.map(function (spot, index) {
      return '' +
        '<div class="modal-spot-card">' +
          '<div class="modal-spot-title">钓点 ' + (index + 1) + '</div>' +
          '<div class="modal-spot-grid">' +
            '<div class="modal-spot-row"><span class="modal-spot-label">坐标</span><span class="coord-tag">' + escapeHtml(spot.loc || '--') + '</span></div>' +
            '<div class="modal-spot-row"><span class="modal-spot-label">深度</span><span class="modal-spot-val">' + escapeHtml(spot.depth || '--') + '</span></div>' +
            '<div class="modal-spot-row"><span class="modal-spot-label">饵料</span><span class="modal-spot-val">' + escapeHtml(spot.bait || fish.bait || '--') + '</span></div>' +
            '<div class="modal-spot-row"><span class="modal-spot-label">时间</span><span class="modal-spot-val">' + escapeHtml(spot.time || '--') + '</span></div>' +
          '</div>' +
        '</div>';
    }).join('');
  }

  if (byId('fishModalOverlay')) byId('fishModalOverlay').classList.add('show');
}

function closeFishModal() {
  if (byId('fishModalOverlay')) byId('fishModalOverlay').classList.remove('show');
  currentModalFish = null;
}

function updateModalBookmarkBtn(fish) {
  var btn = byId('modalBookmarkBtn');
  var icon = byId('modalBookmarkIcon');
  var text = byId('modalBookmarkText');
  if (!btn || !icon || !text) return;

  if (fish && isBookmarked(fish)) {
    btn.classList.add('saved');
    icon.innerHTML = getUiIconSvg('starFilled');
    text.textContent = '已收藏';
  } else {
    btn.classList.remove('saved');
    icon.innerHTML = getUiIconSvg('star');
    text.textContent = '收藏';
  }
}

function toggleModalBookmark() {
  if (!currentModalFish) return;
  var fish = currentModalFish;
  var key = getBookmarkKey(fish);
  if (isBookmarked(fish)) {
    delete fishBookmarks[key];
    delete fishBookmarks[fish.name];
    showToast('已取消收藏 ' + fish.name, 'info');
  } else {
    fishBookmarks[key] = {
      name: fish.name,
      map: fish.map,
      alias: fish.alias,
      bait: fish.bait,
      savedAt: Date.now()
    };
    showToast('已收藏 ' + fish.name, 'success');
  }
  saveBookmarks();
  updateModalBookmarkBtn(fish);
  updateSummaryStats();
  updateGuidePage();
  if (currentNav === BOOKMARK_PAGE) buildBookmarkGrid();
}

function copyFishCoords() {
  if (!currentModalFish) return;
  var fishName = currentModalFish.name;
  var text = currentModalFish.spots.map(function (spot, index) {
    return '钓点' + (index + 1) + ': ' + (spot.loc || '--') + ' | 深度: ' + (spot.depth || '--') + ' | 饵料: ' + (spot.bait || '--') + ' | 时间: ' + (spot.time || '--');
  }).join('\n');
  var full = currentModalFish.name + ' (' + (currentModalFish.alias || '暂无别名') + ')\n' + text;
  copyTextToClipboard(full).then(function (copied) {
    showToast(copied ? ('已复制 ' + fishName + ' 坐标') : '复制失败，请手动复制', copied ? 'success' : 'warn');
  });
}

function openCurrentMapInEncyclopedia() {
  var info = getMapInfo(currentMap);
  var fish = getMapFish(currentMap);
  encCurrentMap = fish.length ? fish[0].mapName : info.name;
  encCurrentPage = 1;
  setNav(ENCYCLOPEDIA_PAGE);
  buildEncyclopediaTabs();
  buildEncyclopediaGrid();
}

function bindEvents() {
  var mapSearch = byId('mapSearch');
  if (mapSearch) {
    mapSearch.addEventListener('input', function () {
      mapSearchQuery = this.value.trim();
      buildMapGrid();
    });
  }

  var guideFishSearchInput = byId('guideFishSearch');
  if (guideFishSearchInput) {
    guideFishSearchInput.addEventListener('input', function () {
      guideFishSearch = this.value.trim();
      updateGuidePage();
    });
  }

  var encSearchInput = byId('encSearch');
  if (encSearchInput) {
    encSearchInput.addEventListener('input', function () {
      encSearch = this.value.trim();
      encCurrentPage = 1;
      buildEncyclopediaGrid();
    });
  }

  var mapStage = byId('mapGrid');
  if (mapStage) {
    mapStage.addEventListener('wheel', function (event) {
      if (currentNav !== MAP_PAGE || Math.abs(event.deltaY) < 12) return;
      event.preventDefault();
      moveMapStage(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeFishModal();
      closeEncDetail();
      return;
    }
    if (isTypingElement(event.target)) return;

    if (event.key === '/') {
      event.preventDefault();
      focusMapSearch();
      return;
    }

    if (event.key >= '1' && event.key <= '4') {
      setNav(Number(event.key) - 1);
      return;
    }

    if (currentNav === MAP_PAGE && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      moveMapStage(event.key === 'ArrowDown' ? 1 : -1);
    }
  });
}

function init() {
  hydrateUiIcons();
  bindEvents();
  updateSummaryStats();
  buildMapGrid();
  buildEncyclopediaTabs();
  buildEncyclopediaGrid();
  buildBookmarkGrid();
  updateGuidePage();
  setNav(MAP_PAGE);
}

document.addEventListener('DOMContentLoaded', init);

window.setNav = setNav;
window.setEncMap = setEncMap;
window.setEncPage = setEncPage;
window.showEncDetailByName = showEncDetailByName;
window.closeEncDetail = closeEncDetail;
window.closeFishModal = closeFishModal;
window.toggleModalBookmark = toggleModalBookmark;
window.copyFishCoords = copyFishCoords;
window.focusMapSearch = focusMapSearch;
window.clearMapSearch = clearMapSearch;
window.clearGuideFishSearch = clearGuideFishSearch;
window.clearEncyclopediaFilters = clearEncyclopediaFilters;
window.openCurrentMapInEncyclopedia = openCurrentMapInEncyclopedia;
window.toggleBookmarkByMapIndex = toggleBookmarkByMapIndex;
window.openFishModalByMapIndex = openFishModalByMapIndex;
window.moveMapStage = moveMapStage;
window.getFishFallbackSvg = getFishFallbackSvg;

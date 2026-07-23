/* Redwood Roots — store locator (Leaflet + OSM, no API key) */
(function () {
  'use strict';
  var dataEl = document.getElementById('retailer-data');
  var mapEl = document.getElementById('map');
  if (!dataEl || !mapEl || typeof L === 'undefined') return;

  var stores = JSON.parse(dataEl.textContent);
  var map = L.map('map', { scrollWheelZoom: false }).setView([37.9, -120.9], 6);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }).addTo(map);

  var DOT_COLORS = ['#DA3B3F', '#F1B12D', '#26A858', '#226EA8'];
  function dotIcon(i) {
    var c = DOT_COLORS[i % 4];
    return L.divIcon({
      className: '',
      html: '<span style="display:block;width:16px;height:16px;border-radius:50%;background:' + c + ';border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>',
      iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10]
    });
  }

  var listEl = document.getElementById('store-list');
  var regionSel = document.getElementById('region-filter');
  var searchInput = document.getElementById('store-search');
  var countEl = document.getElementById('store-count');
  var markers = [];

  stores.forEach(function (s, i) {
    var m = L.marker([s.lat, s.lng], { icon: dotIcon(i), title: s.name });
    var dir = 'https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lng;
    m.bindPopup('<b>' + s.name + '</b><br><small>' + s.region + '</small><br><a href="' + dir + '" target="_blank" rel="noopener">Get directions</a>');
    m.on('click', function () { highlight(i, false); });
    markers.push(m);
  });

  function visible() {
    var q = (searchInput.value || '').toLowerCase().trim();
    var r = regionSel.value;
    return stores.map(function (s, i) { return { s: s, i: i }; }).filter(function (x) {
      return (r === 'all' || x.s.region === r) && (!q || x.s.name.toLowerCase().indexOf(q) !== -1);
    });
  }

  function render() {
    var vis = visible();
    markers.forEach(function (m) { map.removeLayer(m); });
    listEl.innerHTML = '';
    var group = [];
    vis.forEach(function (x) {
      markers[x.i].addTo(map);
      group.push(markers[x.i].getLatLng());
      var div = document.createElement('div');
      div.className = 'store-item';
      div.id = 'store-' + x.i;
      div.setAttribute('role', 'button');
      div.setAttribute('tabindex', '0');
      var dir = 'https://www.google.com/maps/dir/?api=1&destination=' + x.s.lat + ',' + x.s.lng;
      div.innerHTML = '<b>' + x.s.name + '</b><small>' + x.s.region + '</small> · <a href="' + dir + '" target="_blank" rel="noopener">Directions</a>';
      div.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') return;
        highlight(x.i, true);
      });
      div.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); highlight(x.i, true); }
      });
      listEl.appendChild(div);
    });
    countEl.textContent = vis.length + ' location' + (vis.length === 1 ? '' : 's');
    if (group.length) map.fitBounds(L.latLngBounds(group).pad(0.12));
  }

  function highlight(i, pan) {
    [].slice.call(listEl.children).forEach(function (el) { el.classList.remove('active'); });
    var el = document.getElementById('store-' + i);
    if (el) { el.classList.add('active'); el.scrollIntoView({ block: 'nearest' }); }
    if (pan) {
      map.setView(markers[i].getLatLng(), Math.max(map.getZoom(), 11));
      markers[i].openPopup();
    }
  }

  regionSel.addEventListener('change', render);
  searchInput.addEventListener('input', render);

  var nearBtn = document.getElementById('near-me');
  if (nearBtn && navigator.geolocation) {
    nearBtn.addEventListener('click', function () {
      nearBtn.disabled = true;
      nearBtn.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setView([lat, lng], 9);
        L.circleMarker([lat, lng], { radius: 8, color: '#226EA8', fillOpacity: .9 }).addTo(map).bindPopup('You are here');
        var best = null, bestD = Infinity;
        visible().forEach(function (x) {
          var d = Math.pow(x.s.lat - lat, 2) + Math.pow(x.s.lng - lng, 2);
          if (d < bestD) { bestD = d; best = x.i; }
        });
        if (best !== null) highlight(best, false);
        nearBtn.textContent = 'Near me';
        nearBtn.disabled = false;
      }, function () {
        nearBtn.textContent = 'Location unavailable';
        setTimeout(function () { nearBtn.textContent = 'Near me'; nearBtn.disabled = false; }, 2500);
      }, { timeout: 8000 });
    });
  } else if (nearBtn) {
    nearBtn.hidden = true;
  }

  map.on('click', function () { map.scrollWheelZoom.enable(); });
  render();
})();

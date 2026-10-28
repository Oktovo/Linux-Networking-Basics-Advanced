import { useState } from 'react';
import { topologies } from './data/networkTopology';
import NetworkDiagram from './components/NetworkDiagram';
import { ChevronLeft, ChevronRight, Network, BookOpen, Terminal, Info } from 'lucide-react';

export default function App() {
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [showDetails, setShowDetails] = useState(true);

  const topology = topologies[currentWeekIdx];

  const goNext = () => {
    if (currentWeekIdx < topologies.length - 1) setCurrentWeekIdx(currentWeekIdx + 1);
  };
  const goPrev = () => {
    if (currentWeekIdx > 0) setCurrentWeekIdx(currentWeekIdx - 1);
  };

  // Commands for each week
  const weekCommands: Record<number, string[]> = {
    1: [
      'ip netns add client',
      'ip netns add router',
      'ip netns add server',
      'ip link add veth-c type veth peer name veth-rc',
      'ip link set veth-c netns client',
      'ip link set veth-rc netns router',
      'ip netns exec client ip addr add 10.0.1.2/24 dev veth-c',
      'ip netns exec router ip addr add 10.0.1.1/24 dev veth-rc',
      'ip link add veth-s type veth peer name veth-rs',
      'ip link set veth-s netns server',
      'ip link set veth-rs netns router',
      'ip netns exec server ip addr add 10.0.2.2/24 dev veth-s',
      'ip netns exec router ip addr add 10.0.2.1/24 dev veth-rs',
      'ip netns exec client ip link set veth-c up',
      'ip netns exec router ip link set veth-rc up',
      'ip netns exec router ip link set veth-rs up',
      'ip netns exec server ip link set veth-s up',
      'sysctl -w net.ipv4.ip_forward=1',
      'ip netns exec client ip route add default via 10.0.1.1',
      'ip netns exec server ip route add default via 10.0.2.1',
      '# Проверка:',
      'ip netns exec client ping 10.0.2.2',
      'ip netns exec client traceroute 10.0.2.2'
    ],
    2: [
      '# Добавляем NAT на router:',
      'ip netns exec router iptables -t nat -A POSTROUTING -s 10.0.1.0/24 -j MASQUERADE',
      'ip netns exec router iptables -t nat -A POSTROUTING -s 10.0.2.0/24 -j MASQUERADE',
      '',
      '# Проверяем conntrack:',
      'ip netns exec router conntrack -L',
      '',
      '# Тест скорости:',
      'ip netns exec server1 iperf3 -s &',
      'ip netns exec client1 iperf3 -c 10.0.2.2 -t 30'
    ],
    3: [
      '# Создаём bridge:',
      'ip link add br0 type bridge',
      'ip link set br0 up',
      '',
      '# VLAN sub-interfaces:',
      'ip link add link veth-c name veth-c.10 type vlan id 10',
      'ip link add link veth-c name veth-c.20 type vlan id 20',
      '',
      '# Подключаем к bridge:',
      'ip link set veth-c.10 master br0',
      'ip link set veth-c.20 master br0',
      '',
      '# VLAN filtering:',
      'ip link set br0 type bridge vlan_filtering 1',
      'bridge vlan add dev veth-c.10 vid 10 pvid untagged',
      'bridge vlan add dev veth-c.20 vid 20 pvid untagged',
      '',
      '# Проверка изоляции:',
      'ip netns exec vlan10-a ping 10.10.0.3  # OK (тот же VLAN)',
      'ip netns exec vlan10-a ping 10.20.0.2  # FAIL (другой VLAN)',
      '',
      '# Перехват трафика:',
      'tcpdump -i veth-c.10 -e -n'
    ],
    4: [
      '# Inter-VLAN routing через router:',
      'ip link add link veth-router name veth-router.10 type vlan id 10',
      'ip link add link veth-router name veth-router.20 type vlan id 20',
      'ip netns exec router ip addr add 10.10.0.1/24 dev veth-router.10',
      'ip netns exec router ip addr add 10.20.0.1/24 dev veth-router.20',
      'ip netns exec router ip link set veth-router.10 up',
      'ip netns exec router ip link set veth-router.20 up',
      '',
      '# Trunk port на bridge:',
      'bridge vlan add dev veth-router vid 10',
      'bridge vlan add dev veth-router vid 20',
      '',
      '# Проверка:',
      'ip netns exec vlan10-1 ping 10.20.0.2  # через router!',
      'ip netns exec router tcpdump -i veth-router -e'
    ],
    5: [
      '# SNAT (исходящий трафик):',
      'ip netns exec router iptables -t nat -A POSTROUTING \\',
      '  -s 10.0.1.0/24 -o veth-out -j MASQUERADE',
      '',
      '# DNAT (проброс порта 8080 → server:80):',
      'ip netns exec router iptables -t nat -A PREROUTING \\',
      '  -i veth-out -p tcp --dport 8080 \\',
      '  -j DNAT --to-destination 10.0.2.2:80',
      '',
      '# Разрешаем forwarding:',
      'ip netns exec router iptables -A FORWARD \\',
      '  -d 10.0.2.2 -p tcp --dport 80 -j ACCEPT',
      '',
      '# Проверка conntrack:',
      'ip netns exec router conntrack -L',
      'ip netns exec router conntrack -S',
      '',
      '# Тест из "интернета":',
      'curl http://192.168.1.1:8080'
    ],
    6: [
      '# Добавляем IPv6 адреса:',
      'ip netns exec client ip -6 addr add fd00:1::2/64 dev veth-c',
      'ip netns exec router ip -6 addr add fd00:1::1/64 dev veth-rc',
      'ip netns exec router ip -6 addr add fd00:2::1/64 dev veth-rs',
      'ip netns exec server ip -6 addr add fd00:2::2/64 dev veth-s',
      '',
      '# Поднимаем интерфейсы:',
      'ip netns exec client ip -6 link set veth-c up',
      'ip netns exec router ip -6 link set veth-rc up',
      'ip netns exec router ip -6 link set veth-rs up',
      'ip netns exec server ip -6 link set veth-s up',
      '',
      '# IPv6 маршрутизация:',
      'ip netns exec client ip -6 route add default via fd00:1::1',
      'ip netns exec server ip -6 route add default via fd00:2::1',
      '',
      '# Проверка:',
      'ip netns exec client ping6 fd00:2::2',
      'ip netns exec client traceroute6 fd00:2::2',
      'ip netns exec client ip -6 neigh show'
    ],
    7: [
      '# Таблицы маршрутизации:',
      'echo "100 isp1" >> /etc/iproute2/rt_tables',
      'echo "200 isp2" >> /etc/iproute2/rt_tables',
      '',
      '# Маршруты в таблицах:',
      'ip netns exec router ip route add default via 10.0.3.1 table isp1',
      'ip netns exec router ip route add default via 10.0.4.1 table isp2',
      '',
      '# Policy rules:',
      'ip netns exec router ip rule add from 10.0.1.2 lookup isp1',
      'ip netns exec router ip rule add from 10.0.1.3 lookup isp2',
      'ip netns exec router ip rule show',
      '',
      '# Traffic Control (эмуляция задержки):',
      'ip netns exec router tc qdisc add dev veth-c root netem delay 100ms',
      'ip netns exec router tc qdisc change dev veth-c root netem delay 100ms loss 5%',
      '',
      '# Проверка:',
      'ip netns exec client1 ping 8.8.8.8  # через isp1',
      'ip netns exec client2 ping 8.8.8.8  # через isp2'
    ],
    8: [
      '# VXLAN туннель:',
      'ip netns exec site-a ip link add vxlan0 type vxlan \\',
      '  id 42 \\',
      '  remote 10.0.0.2 \\',
      '  local 10.0.0.1 \\',
      '  dstport 4789 \\',
      '  dev eth0',
      '',
      'ip netns exec site-b ip link add vxlan0 type vxlan \\',
      '  id 42 \\',
      '  remote 10.0.0.1 \\',
      '  local 10.0.0.2 \\',
      '  dstport 4789 \\',
      '  dev eth0',
      '',
      '# IP адреса на VXLAN:',
      'ip netns exec site-a ip addr add 172.16.1.2/24 dev vxlan0',
      'ip netns exec site-b ip addr add 172.16.1.3/24 dev vxlan0',
      'ip netns exec site-a ip link set vxlan0 up',
      'ip netns exec site-b ip link set vxlan0 up',
      '',
      '# Проверка:',
      'ip netns exec site-a ping 172.16.1.3',
      'tcpdump -i eth0 udp port 4789  # видим VXLAN-инкапсуляцию'
    ],
    99: [
      '# ИТОГОВЫЙ СТЕНД — всё вместе!',
      '',
      '# Компоненты:',
      '# ✓ Network Namespaces (client, router, server)',
      '# ✓ VLAN (10, 20) с bridge filtering',
      '# ✓ Inter-VLAN routing через router',
      '# ✓ NAT (SNAT + DNAT) + conntrack',
      '# ✓ IPv6 Dual-Stack (fd00::/64)',
      '# ✓ Policy Routing (isp1, isp2)',
      '# ✓ Traffic Control (netem delay/loss)',
      '# ✓ VXLAN overlay (VNI 42, UDP 4789)',
      '',
      '# Проверка всего:',
      'ip netns list',
      'ip -d link show type vxlan',
      'bridge vlan show',
      'iptables -t nat -L -n -v',
      'ip rule show',
      'tc qdisc show',
      'conntrack -L',
      'ip -6 neigh show'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Network size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Cloud Network Topology</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Linux Networking • Месяцы 1-2</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              {showDetails ? 'Скрыть команды' : 'Показать команды'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goPrev}
              disabled={currentWeekIdx === 0}
              className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">Назад</span>
            </button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                  {topology.week === 99 ? 'ИТОГ' : `Неделя ${topology.week}`}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{topology.subtitle}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                {topology.title}
              </h2>
            </div>

            <button
              onClick={goNext}
              disabled={currentWeekIdx === topologies.length - 1}
              className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              <span className="text-sm">Далее</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Week pills */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
            {topologies.map((t, i) => (
              <button
                key={i}
                onClick={() => setCurrentWeekIdx(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  i === currentWeekIdx
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {t.week === 99 ? '🏆 Итог' : `W${t.week}`}
              </button>
            ))}
          </div>
        </div>

        {/* Network Diagram */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <NetworkDiagram topology={topology} />
        </div>

        {/* Commands Section */}
        {showDetails && weekCommands[topology.week] && (
          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl shadow-lg border border-gray-700 overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
              <Terminal size={16} className="text-green-400" />
              <span className="text-sm font-mono text-green-400">Команды для развёртывания</span>
              <span className="ml-auto text-xs text-gray-500">bash</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-green-300 leading-relaxed">
                {weekCommands[topology.week].map((line, i) => {
                  if (line.startsWith('#')) {
                    return <div key={i} className="text-gray-500">{line}</div>;
                  }
                  if (line === '') {
                    return <div key={i} className="h-3"></div>;
                  }
                  return <div key={i}>{line}</div>;
                })}
              </pre>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-purple-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Что изучаем</h3>
            </div>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {topology.week === 1 && (
                <>
                  <li>• Network namespaces — изоляция сетевого стека</li>
                  <li>• veth pairs — виртуальные ethernet-кабели</li>
                  <li>• Маршрутизация между namespace</li>
                  <li>• ip_forward — включение routing</li>
                </>
              )}
              {topology.week === 2 && (
                <>
                  <li>• Масштабирование стенда до 5 namespace</li>
                  <li>• NAT (MASQUERADE) для выхода "в интернет"</li>
                  <li>• conntrack — отслеживание соединений</li>
                  <li>• iperf3 — нагрузочное тестирование</li>
                </>
              )}
              {topology.week === 3 && (
                <>
                  <li>• VLAN 802.1Q — тегирование кадров</li>
                  <li>• Linux Bridge — виртуальный коммутатор</li>
                  <li>• VLAN filtering — изоляция трафика</li>
                  <li>• tcpdump — перехват и анализ кадров</li>
                </>
              )}
              {topology.week === 4 && (
                <>
                  <li>• Inter-VLAN routing — маршрутизация между VLAN</li>
                  <li>• Trunk port — несёт несколько VLAN</li>
                  <li>• PVID, tagged/untagged порты</li>
                  <li>• iptables для блокировки inter-VLAN</li>
                </>
              )}
              {topology.week === 5 && (
                <>
                  <li>• SNAT — подмена источника</li>
                  <li>• DNAT — проброс портов</li>
                  <li>• MASQUERADE — динамический SNAT</li>
                  <li>• conntrack — таблица состояний</li>
                </>
              )}
              {topology.week === 6 && (
                <>
                  <li>• IPv6 адреса: link-local, ULA, GUA</li>
                  <li>• Dual-stack — IPv4 + IPv6 одновременно</li>
                  <li>• NDP (Neighbor Discovery) вместо ARP</li>
                  <li>• Router Advertisement (RA)</li>
                </>
              )}
              {topology.week === 7 && (
                <>
                  <li>• Policy routing — маршрутизация по правилам</li>
                  <li>• ip rule / ip route table</li>
                  <li>• tc (traffic control) — управление очередями</li>
                  <li>• netem — эмуляция задержек и потерь</li>
                </>
              )}
              {topology.week === 8 && (
                <>
                  <li>• VXLAN — overlay-сети</li>
                  <li>• Инкапсуляция L2 в L3 (UDP 4789)</li>
                  <li>• VNI — VXLAN Network Identifier</li>
                  <li>• Overhead ~50 байт на пакет</li>
                </>
              )}
              {topology.week === 99 && (
                <>
                  <li>• Все технологии вместе в одном стенде</li>
                  <li>• Overlay + Underlay архитектура</li>
                  <li>• Multi-site с VXLAN</li>
                  <li>• Полный NAT + VLAN + IPv6 + Policy</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Ключевые команды</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">ip netns</code>
                <span className="text-gray-600 dark:text-gray-400">— управление namespace</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">ip link / addr / route</code>
                <span className="text-gray-600 dark:text-gray-400">— интерфейсы и маршруты</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">bridge vlan</code>
                <span className="text-gray-600 dark:text-gray-400">— VLAN на bridge</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">iptables -t nat</code>
                <span className="text-gray-600 dark:text-gray-400">— NAT правила</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">tc qdisc</code>
                <span className="text-gray-600 dark:text-gray-400">— traffic control</span>
              </div>
              <div className="flex items-start gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400">conntrack -L</code>
                <span className="text-gray-600 dark:text-gray-400">— таблица соединений</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Прогресс по неделям</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {topologies.map((t, i) => (
              <button
                key={i}
                onClick={() => setCurrentWeekIdx(i)}
                className={`p-2 rounded-lg text-center transition-all ${
                  i === currentWeekIdx
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                    : i < currentWeekIdx
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="text-xs font-bold">{t.week === 99 ? '🏆' : `W${t.week}`}</div>
                <div className="text-[10px] mt-0.5 truncate">
                  {t.week === 99 ? 'Итог' : t.title.split('—')[0].trim().substring(0, 12)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Cloud Network Topology • Linux Networking • Месяцы 1-2 из 72 недель
      </footer>
    </div>
  );
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'namespace' | 'bridge' | 'host' | 'cloud' | 'router' | 'switch';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  details?: string[];
}

export interface NetworkLink {
  id: string;
  from: string;
  to: string;
  label?: string;
  color?: string;
  dashed?: boolean;
  type?: 'veth' | 'bridge' | 'vlan' | 'vxlan' | 'route';
}

export interface NetworkTopology {
  week: number;
  title: string;
  subtitle: string;
  nodes: NetworkNode[];
  links: NetworkLink[];
  legend: { color: string; label: string }[];
}

export const topologies: NetworkTopology[] = [
  // ====== НЕДЕЛЯ 1: Базовые namespace ======
  {
    week: 1,
    title: "Network Namespaces — Базовый стенд",
    subtitle: "3 namespace + veth-пары + маршрутизация",
    nodes: [
      {
        id: 'client',
        label: 'client',
        type: 'namespace',
        x: 50, y: 150,
        width: 160, height: 120,
        color: '#3b82f6',
        details: ['veth-c', '10.0.1.2/24', 'gw 10.0.1.1']
      },
      {
        id: 'router',
        label: 'router',
        type: 'router',
        x: 320, y: 130,
        width: 180, height: 160,
        color: '#f59e0b',
        details: ['veth-rc: 10.0.1.1/24', 'veth-rs: 10.0.2.1/24', 'ip_forward=1']
      },
      {
        id: 'server',
        label: 'server',
        type: 'namespace',
        x: 610, y: 150,
        width: 160, height: 120,
        color: '#10b981',
        details: ['veth-s', '10.0.2.2/24', 'gw 10.0.2.1']
      }
    ],
    links: [
      { id: 'l1', from: 'client', to: 'router', label: 'veth-c ↔ veth-rc', type: 'veth', color: '#6366f1' },
      { id: 'l2', from: 'router', to: 'server', label: 'veth-rs ↔ veth-s', type: 'veth', color: '#6366f1' }
    ],
    legend: [
      { color: '#3b82f6', label: 'Namespace (client)' },
      { color: '#f59e0b', label: 'Namespace (router)' },
      { color: '#10b981', label: 'Namespace (server)' },
      { color: '#6366f1', label: 'veth pair' }
    ]
  },

  // ====== НЕДЕЛЯ 2: 5 namespace + NAT ======
  {
    week: 2,
    title: "Network Namespaces — Усложнение",
    subtitle: "5 namespace + NAT + iperf3",
    nodes: [
      {
        id: 'client1',
        label: 'client1',
        type: 'namespace',
        x: 30, y: 50,
        width: 140, height: 90,
        color: '#3b82f6',
        details: ['10.0.1.2/24']
      },
      {
        id: 'client2',
        label: 'client2',
        type: 'namespace',
        x: 30, y: 200,
        width: 140, height: 90,
        color: '#3b82f6',
        details: ['10.0.1.3/24']
      },
      {
        id: 'router',
        label: 'router',
        type: 'router',
        x: 280, y: 100,
        width: 180, height: 160,
        color: '#f59e0b',
        details: ['10.0.1.1/24', '10.0.2.1/24', 'SNAT (MASQUERADE)', 'ip_forward=1']
      },
      {
        id: 'server1',
        label: 'server1',
        type: 'namespace',
        x: 570, y: 50,
        width: 140, height: 90,
        color: '#10b981',
        details: ['10.0.2.2/24']
      },
      {
        id: 'server2',
        label: 'server2',
        type: 'namespace',
        x: 570, y: 200,
        width: 140, height: 90,
        color: '#10b981',
        details: ['10.0.2.3/24']
      },
      {
        id: 'internet',
        label: '"Internet"',
        type: 'cloud',
        x: 280, y: 320,
        width: 180, height: 80,
        color: '#8b5cf6',
        details: ['192.168.1.0/24', '(loopback эмуляция)']
      }
    ],
    links: [
      { id: 'l1', from: 'client1', to: 'router', label: 'veth', type: 'veth', color: '#6366f1' },
      { id: 'l2', from: 'client2', to: 'router', label: 'veth', type: 'veth', color: '#6366f1' },
      { id: 'l3', from: 'router', to: 'server1', label: 'veth', type: 'veth', color: '#6366f1' },
      { id: 'l4', from: 'router', to: 'server2', label: 'veth', type: 'veth', color: '#6366f1' },
      { id: 'l5', from: 'router', to: 'internet', label: 'SNAT/MASQUERADE', type: 'route', color: '#8b5cf6', dashed: true }
    ],
    legend: [
      { color: '#3b82f6', label: 'Client namespace' },
      { color: '#f59e0b', label: 'Router namespace' },
      { color: '#10b981', label: 'Server namespace' },
      { color: '#8b5cf6', label: 'Internet (эмуляция)' }
    ]
  },

  // ====== НЕДЕЛЯ 3: VLAN + Bridge ======
  {
    week: 3,
    title: "VLAN + Linux Bridge — Основы",
    subtitle: "Bridge с VLAN filtering, изоляция VLAN 10/20",
    nodes: [
      {
        id: 'br0',
        label: 'br0 (Linux Bridge)',
        type: 'bridge',
        x: 300, y: 140,
        width: 220, height: 100,
        color: '#ec4899',
        details: ['VLAN-aware', 'VLAN 10, 20', 'vlan filtering enabled']
      },
      {
        id: 'vlan10-a',
        label: 'ns-vlan10-a',
        type: 'namespace',
        x: 40, y: 40,
        width: 160, height: 90,
        color: '#06b6d4',
        details: ['veth.10 (tagged)', '10.10.0.2/24', 'VLAN 10']
      },
      {
        id: 'vlan10-b',
        label: 'ns-vlan10-b',
        type: 'namespace',
        x: 40, y: 170,
        width: 160, height: 90,
        color: '#06b6d4',
        details: ['veth.10 (tagged)', '10.10.0.3/24', 'VLAN 10']
      },
      {
        id: 'vlan20-a',
        label: 'ns-vlan20-a',
        type: 'namespace',
        x: 610, y: 40,
        width: 160, height: 90,
        color: '#f97316',
        details: ['veth.20 (tagged)', '10.20.0.2/24', 'VLAN 20']
      },
      {
        id: 'vlan20-b',
        label: 'ns-vlan20-b',
        type: 'namespace',
        x: 610, y: 170,
        width: 160, height: 90,
        color: '#f97316',
        details: ['veth.20 (tagged)', '10.20.0.3/24', 'VLAN 20']
      }
    ],
    links: [
      { id: 'l1', from: 'vlan10-a', to: 'br0', label: 'VLAN 10 tagged', type: 'vlan', color: '#06b6d4' },
      { id: 'l2', from: 'vlan10-b', to: 'br0', label: 'VLAN 10 tagged', type: 'vlan', color: '#06b6d4' },
      { id: 'l3', from: 'vlan20-a', to: 'br0', label: 'VLAN 20 tagged', type: 'vlan', color: '#f97316' },
      { id: 'l4', from: 'vlan20-b', to: 'br0', label: 'VLAN 20 tagged', type: 'vlan', color: '#f97316' }
    ],
    legend: [
      { color: '#06b6d4', label: 'VLAN 10 (10.10.0.0/24)' },
      { color: '#f97316', label: 'VLAN 20 (10.20.0.0/24)' },
      { color: '#ec4899', label: 'Linux Bridge (VLAN-aware)' }
    ]
  },

  // ====== НЕДЕЛЯ 4: Inter-VLAN Routing ======
  {
    week: 4,
    title: "Inter-VLAN Routing",
    subtitle: "Маршрутизация между VLAN через router + trunk",
    nodes: [
      {
        id: 'vlan10-1',
        label: 'ns-vlan10-1',
        type: 'namespace',
        x: 30, y: 30,
        width: 150, height: 80,
        color: '#06b6d4',
        details: ['10.10.0.2/24', 'gw 10.10.0.1']
      },
      {
        id: 'vlan10-2',
        label: 'ns-vlan10-2',
        type: 'namespace',
        x: 30, y: 140,
        width: 150, height: 80,
        color: '#06b6d4',
        details: ['10.10.0.3/24', 'gw 10.10.0.1']
      },
      {
        id: 'br0',
        label: 'br0',
        type: 'bridge',
        x: 260, y: 60,
        width: 140, height: 80,
        color: '#ec4899',
        details: ['VLAN 10 + 20']
      },
      {
        id: 'router',
        label: 'router',
        type: 'router',
        x: 470, y: 30,
        width: 180, height: 160,
        color: '#f59e0b',
        details: ['trunk port (tagged)', '10.10.0.1/24 (VLAN 10)', '10.20.0.1/24 (VLAN 20)', 'ip_forward=1']
      },
      {
        id: 'br1',
        label: 'br1',
        type: 'bridge',
        x: 260, y: 180,
        width: 140, height: 80,
        color: '#ec4899',
        details: ['VLAN 10 + 20']
      },
      {
        id: 'vlan20-1',
        label: 'ns-vlan20-1',
        type: 'namespace',
        x: 700, y: 30,
        width: 150, height: 80,
        color: '#f97316',
        details: ['10.20.0.2/24', 'gw 10.20.0.1']
      },
      {
        id: 'vlan20-2',
        label: 'ns-vlan20-2',
        type: 'namespace',
        x: 700, y: 140,
        width: 150, height: 80,
        color: '#f97316',
        details: ['10.20.0.3/24', 'gw 10.20.0.1']
      }
    ],
    links: [
      { id: 'l1', from: 'vlan10-1', to: 'br0', label: 'VLAN 10', type: 'vlan', color: '#06b6d4' },
      { id: 'l2', from: 'vlan10-2', to: 'br0', label: 'VLAN 10', type: 'vlan', color: '#06b6d4' },
      { id: 'l3', from: 'br0', to: 'router', label: 'trunk', type: 'vlan', color: '#ec4899' },
      { id: 'l4', from: 'router', to: 'br1', label: 'trunk', type: 'vlan', color: '#ec4899' },
      { id: 'l5', from: 'br1', to: 'vlan20-1', label: 'VLAN 20', type: 'vlan', color: '#f97316' },
      { id: 'l6', from: 'br1', to: 'vlan20-2', label: 'VLAN 20', type: 'vlan', color: '#f97316' }
    ],
    legend: [
      { color: '#06b6d4', label: 'VLAN 10 hosts' },
      { color: '#f97316', label: 'VLAN 20 hosts' },
      { color: '#ec4899', label: 'Bridge (trunk)' },
      { color: '#f59e0b', label: 'Router (inter-VLAN)' }
    ]
  },

  // ====== НЕДЕЛЯ 5: NAT + conntrack ======
  {
    week: 5,
    title: "NAT + conntrack",
    subtitle: "SNAT, DNAT (проброс порта), conntrack",
    nodes: [
      {
        id: 'client',
        label: 'client',
        type: 'namespace',
        x: 40, y: 120,
        width: 150, height: 100,
        color: '#3b82f6',
        details: ['10.0.1.2/24', 'gw 10.0.1.1']
      },
      {
        id: 'router',
        label: 'router',
        type: 'router',
        x: 290, y: 60,
        width: 220, height: 200,
        color: '#f59e0b',
        details: ['10.0.1.1/24 (внутр.)', '192.168.1.1/24 (внешн.)', 'SNAT: MASQUERADE', 'DNAT: :8080→server:80', 'conntrack таблица']
      },
      {
        id: 'server',
        label: 'server',
        type: 'namespace',
        x: 290, y: 300,
        width: 150, height: 90,
        color: '#10b981',
        details: ['10.0.2.2/24', ':80 (nginx)']
      },
      {
        id: 'internet',
        label: '"Internet"',
        type: 'cloud',
        x: 610, y: 120,
        width: 180, height: 100,
        color: '#8b5cf6',
        details: ['192.168.1.0/24', 'внешний хост']
      }
    ],
    links: [
      { id: 'l1', from: 'client', to: 'router', label: 'SNAT → 192.168.1.1', type: 'route', color: '#f59e0b' },
      { id: 'l2', from: 'router', to: 'internet', label: 'исходящий трафик', type: 'route', color: '#8b5cf6' },
      { id: 'l3', from: 'router', to: 'server', label: 'DNAT :8080→:80', type: 'route', color: '#10b981', dashed: true }
    ],
    legend: [
      { color: '#3b82f6', label: 'Client (внутренняя сеть)' },
      { color: '#f59e0b', label: 'Router (NAT)' },
      { color: '#10b981', label: 'Server (DMZ)' },
      { color: '#8b5cf6', label: 'Internet (внешняя сеть)' }
    ]
  },

  // ====== НЕДЕЛЯ 6: IPv6 Dual-Stack ======
  {
    week: 6,
    title: "IPv6 Dual-Stack",
    subtitle: "Одновременная работа IPv4 + IPv6, NDP",
    nodes: [
      {
        id: 'client',
        label: 'client',
        type: 'namespace',
        x: 50, y: 100,
        width: 180, height: 140,
        color: '#3b82f6',
        details: ['IPv4: 10.0.1.2/24', 'IPv6: fd00:1::2/64', ' NDP таблица', 'gw: 10.0.1.1 / fd00:1::1']
      },
      {
        id: 'router',
        label: 'router',
        type: 'router',
        x: 330, y: 80,
        width: 200, height: 180,
        color: '#f59e0b',
        details: ['IPv4: 10.0.1.1, 10.0.2.1', 'IPv6: fd00:1::1, fd00:2::1', 'dual-stack routing', 'RA + NDP']
      },
      {
        id: 'server',
        label: 'server',
        type: 'namespace',
        x: 620, y: 100,
        width: 180, height: 140,
        color: '#10b981',
        details: ['IPv4: 10.0.2.2/24', 'IPv6: fd00:2::2/64', ' NDP таблица', 'gw: 10.0.2.1 / fd00:2::1']
      }
    ],
    links: [
      { id: 'l1', from: 'client', to: 'router', label: 'IPv4 + IPv6', type: 'veth', color: '#6366f1' },
      { id: 'l2', from: 'router', to: 'server', label: 'IPv4 + IPv6', type: 'veth', color: '#6366f1' }
    ],
    legend: [
      { color: '#3b82f6', label: 'Client (dual-stack)' },
      { color: '#f59e0b', label: 'Router (dual-stack)' },
      { color: '#10b981', label: 'Server (dual-stack)' },
      { color: '#6366f1', label: 'Dual-stack link' }
    ]
  },

  // ====== НЕДЕЛЯ 7: Policy Routing + tc ======
  {
    week: 7,
    title: "Policy Routing + tc",
    subtitle: "Маршрутизация по правилам + эмуляция задержек/потерь",
    nodes: [
      {
        id: 'client1',
        label: 'client1',
        type: 'namespace',
        x: 30, y: 40,
        width: 150, height: 80,
        color: '#3b82f6',
        details: ['10.0.1.2/24', 'rule → table isp1']
      },
      {
        id: 'client2',
        label: 'client2',
        type: 'namespace',
        x: 30, y: 200,
        width: 150, height: 80,
        color: '#3b82f6',
        details: ['10.0.1.3/24', 'rule → table isp2']
      },
      {
        id: 'router',
        label: 'router',
        type: 'router',
        x: 280, y: 80,
        width: 200, height: 180,
        color: '#f59e0b',
        details: ['ip rule show:', '  from 10.0.1.2 lookup isp1', '  from 10.0.1.3 lookup isp2', 'tc qdisc: netem delay 100ms', 'tc loss 5%']
      },
      {
        id: 'isp1',
        label: 'ISP 1',
        type: 'cloud',
        x: 580, y: 20,
        width: 160, height: 80,
        color: '#ef4444',
        details: ['table isp1', 'через gw1']
      },
      {
        id: 'isp2',
        label: 'ISP 2',
        type: 'cloud',
        x: 580, y: 200,
        width: 160, height: 80,
        color: '#22c55e',
        details: ['table isp2', 'через gw2']
      }
    ],
    links: [
      { id: 'l1', from: 'client1', to: 'router', label: 'policy → isp1', type: 'route', color: '#ef4444' },
      { id: 'l2', from: 'client2', to: 'router', label: 'policy → isp2', type: 'route', color: '#22c55e' },
      { id: 'l3', from: 'router', to: 'isp1', label: 'table isp1', type: 'route', color: '#ef4444' },
      { id: 'l4', from: 'router', to: 'isp2', label: 'table isp2', type: 'route', color: '#22c55e' }
    ],
    legend: [
      { color: '#ef4444', label: 'ISP 1 (client1 → isp1)' },
      { color: '#22c55e', label: 'ISP 2 (client2 → isp2)' },
      { color: '#f59e0b', label: 'Router (policy routing + tc)' }
    ]
  },

  // ====== НЕДЕЛЯ 8: VXLAN ======
  {
    week: 8,
    title: "VXLAN Overlay",
    subtitle: "Инкапсуляция L2 в L3 через UDP 4789, VNI 42",
    nodes: [
      {
        id: 'site-a-host',
        label: 'host-a',
        type: 'namespace',
        x: 30, y: 100,
        width: 160, height: 120,
        color: '#3b82f6',
        details: ['vxlan0: 172.16.1.2/24', 'VNI 42', 'remote → 10.0.0.2', 'UDP dst 4789']
      },
      {
        id: 'underlay',
        label: 'Underlay (L3)',
        type: 'cloud',
        x: 300, y: 110,
        width: 220, height: 100,
        color: '#64748b',
        details: ['10.0.0.0/24', 'site-a: 10.0.0.1', 'site-b: 10.0.0.2', 'VXLAN overhead ~50B']
      },
      {
        id: 'site-b-host',
        label: 'host-b',
        type: 'namespace',
        x: 630, y: 100,
        width: 160, height: 120,
        color: '#10b981',
        details: ['vxlan0: 172.16.1.3/24', 'VNI 42', 'remote → 10.0.0.1', 'UDP dst 4789']
      }
    ],
    links: [
      { id: 'l1', from: 'site-a-host', to: 'underlay', label: 'VXLAN encapsulation', type: 'vxlan', color: '#8b5cf6' },
      { id: 'l2', from: 'underlay', to: 'site-b-host', label: 'UDP:4789', type: 'vxlan', color: '#8b5cf6' }
    ],
    legend: [
      { color: '#3b82f6', label: 'Site A (172.16.1.0/24 overlay)' },
      { color: '#10b981', label: 'Site B (172.16.1.0/24 overlay)' },
      { color: '#64748b', label: 'Underlay L3 network' },
      { color: '#8b5cf6', label: 'VXLAN tunnel (VNI 42)' }
    ]
  },

  // ====== ИТОГОВЫЙ СТЕНД ======
  {
    week: 99,
    title: "🏆 ИТОГОВЫЙ СТЕНД (Месяцы 1-2)",
    subtitle: "Всё вместе: namespaces + VLAN + NAT + IPv6 + VXLAN",
    nodes: [
      {
        id: 'site-a',
        label: 'Site A',
        type: 'cloud',
        x: 20, y: 20,
        width: 340, height: 320,
        color: '#3b82f6',
        details: ['VXLAN VNI 42', '172.16.1.0/24 (overlay)', 'VLAN 10 + VLAN 20', 'IPv4 + IPv6 dual-stack']
      },
      {
        id: 'router-a',
        label: 'router-a',
        type: 'router',
        x: 100, y: 100,
        width: 180, height: 160,
        color: '#f59e0b',
        details: ['inter-VLAN routing', 'SNAT/MASQUERADE', 'policy routing', 'tc (netem)', 'dual-stack']
      },
      {
        id: 'underlay',
        label: 'Underlay L3',
        type: 'cloud',
        x: 380, y: 120,
        width: 160, height: 120,
        color: '#64748b',
        details: ['10.0.0.0/24', 'VXLAN UDP:4789']
      },
      {
        id: 'site-b',
        label: 'Site B',
        type: 'cloud',
        x: 560, y: 20,
        width: 340, height: 320,
        color: '#10b981',
        details: ['VXLAN VNI 42', '172.16.1.0/24 (overlay)', 'VLAN 10 + VLAN 20', 'IPv4 + IPv6 dual-stack']
      },
      {
        id: 'router-b',
        label: 'router-b',
        type: 'router',
        x: 640, y: 100,
        width: 180, height: 160,
        color: '#f59e0b',
        details: ['inter-VLAN routing', 'DNAT (проброс)', 'conntrack', 'dual-stack']
      },
      {
        id: 'internet',
        label: '"Internet"',
        type: 'cloud',
        x: 350, y: 360,
        width: 220, height: 80,
        color: '#8b5cf6',
        details: ['192.168.1.0/24', 'внешний мир']
      }
    ],
    links: [
      { id: 'l1', from: 'site-a', to: 'underlay', label: 'VXLAN VNI 42', type: 'vxlan', color: '#8b5cf6' },
      { id: 'l2', from: 'underlay', to: 'site-b', label: 'VXLAN VNI 42', type: 'vxlan', color: '#8b5cf6' },
      { id: 'l3', from: 'router-a', to: 'internet', label: 'SNAT', type: 'route', color: '#f59e0b', dashed: true },
      { id: 'l4', from: 'router-b', to: 'internet', label: 'SNAT/DNAT', type: 'route', color: '#f59e0b', dashed: true }
    ],
    legend: [
      { color: '#3b82f6', label: 'Site A (overlay + VLAN)' },
      { color: '#10b981', label: 'Site B (overlay + VLAN)' },
      { color: '#f59e0b', label: 'Routers (NAT + policy)' },
      { color: '#64748b', label: 'Underlay L3' },
      { color: '#8b5cf6', label: 'VXLAN tunnel / Internet' }
    ]
  }
];

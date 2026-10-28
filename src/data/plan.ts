export interface DayTask {
  day: string;
  tasks: string[];
}

export interface Checkpoint {
  id: string;
  text: string;
  checked: boolean;
}

export interface Week {
  id: number;
  title: string;
  dates: string;
  readings: string[];
  dailyTasks: DayTask[];
  checkpoints: Checkpoint[];
}

export interface Month {
  id: number;
  title: string;
  subtitle: string;
  weeks: Week[];
}

export const planData: Month[] = [
  {
    id: 1,
    title: "МЕСЯЦ 1 (Сентябрь 2026)",
    subtitle: "Linux Networking — Основы",
    weeks: [
      {
        id: 1,
        title: "Network Namespaces — Теория и база",
        dates: "1–7 сен",
        readings: [
          "man 7 network_namespaces (в терминале)",
          "man 8 ip-netns (в терминале)",
          "Scott Lowe \"Introducing Linux Network Namespaces\" (блог)",
          "YouTube: NetworkChuck \"Linux Namespaces\""
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Прочитать man-страницы, законспектировать: что такое namespace, зачем нужен, чем отличается от chroot/cgroups",
              "Написать 3-5 предложений резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Создать 3 namespace: ip netns add client, ip netns add router, ip netns add server",
              "Создать veth-пары: ip link add veth-c type veth peer name veth-rc",
              "Переместить концы в namespace: ip link set veth-c netns client",
              "Назначить IP: ip netns exec client ip addr add 10.0.1.2/24 dev veth-c"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Поднять интерфейсы (ip link set up)",
              "Настроить маршрутизацию на router",
              "Включить ip_forward (sysctl net.ipv4.ip_forward=1)",
              "Проверить ping от client к server"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Создать репозиторий cloud-net-labs на GitHub",
              "Написать README.md с описанием стенда",
              "Написать скрипт setup.sh (с set -e) и teardown.sh"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Проверить контрольные точки",
              "Сломать: выключить ip_forward, убедиться что пинг падает. Включить обратно",
              "Написать отчёт"
            ]
          }
        ],
        checkpoints: [
          { id: "w1c1", text: "ip netns list показывает 3 namespace", checked: false },
          { id: "w1c2", text: "ping 10.0.2.2 из client проходит через router", checked: false },
          { id: "w1c3", text: "traceroute 10.0.2.2 показывает 2 хопа", checked: false },
          { id: "w1c4", text: "Скрипты setup.sh / teardown.sh работают", checked: false },
          { id: "w1c5", text: "README на GitHub", checked: false }
        ]
      },
      {
        id: 2,
        title: "Network Namespaces — Усложнение",
        dates: "8–14 сен",
        readings: [
          "Rami Rosen \"Linux Kernel Networking\" главы 1-2",
          "Arch Wiki: \"Network namespaces\"",
          "Статья: \"Linux Network Stack Walkthrough\" (blog.cloudflare.com)"
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Прочитать про то, как ядро создаёт сетевой стек для каждого namespace",
              "Понять разницу между ip netns exec и nsenter",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Усложнить стенд до 5 namespace: client1, client2, router, server1, server2",
              "Настроить маршрутизацию: client1 → server1 и client2 → server2"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Добавить NAT через iptables на router (SNAT для выхода \"в интернет\")",
              "Проверить conntrack -L",
              "Протестировать iperf3 между client и server"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Написать скрипт автоматизации на bash",
              "Добавить комментарии",
              "Запушить в Git"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Нагрузочный тест iperf3 -c 10.0.2.2 -t 30",
              "Сломать: убить один veth, проверить failover",
              "Написать отчёт"
            ]
          }
        ],
        checkpoints: [
          { id: "w2c1", text: "5 namespace, все пингуются через router", checked: false },
          { id: "w2c2", text: "NAT работает (conntrack -L показывает записи)", checked: false },
          { id: "w2c3", text: "iperf3 показывает скорость", checked: false },
          { id: "w2c4", text: "Скрипт автоматизации работает", checked: false },
          { id: "w2c5", text: "Git commit с понятным сообщением", checked: false }
        ]
      },
      {
        id: 3,
        title: "VLAN + Linux Bridge — Основы",
        dates: "15–21 сен",
        readings: [
          "man 8 bridge (в терминале)",
          "man 8 ip-link (раздел про VLAN sub-interfaces)",
          "Arch Wiki: \"VLAN\" и \"Network bridge\"",
          "YouTube: \"VLAN explained\" (NetworkChuck или David Bombal)"
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Разобраться: что такое VLAN tag (802.1Q), зачем нужен",
              "Как bridge отличается от switch",
              "Нарисовать ASCII-диаграмму",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Создать Linux bridge: ip link add br0 type bridge",
              "Создать VLAN sub-interfaces: ip link add link veth-c name veth-c.10 type vlan id 10",
              "Подключить к bridge",
              "Настроить 2 VLAN (10 и 20) с разными подсетями"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Проверить изоляцию: client в VLAN 10 НЕ должен пинговать client в VLAN 20",
              "Внутри VLAN — должен",
              "Перехватить трафик: tcpdump -i veth-c.10 -e и проверить VLAN tag"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Написать setup.sh и teardown.sh для VLAN-стенда",
              "Нарисовать схему в draw.io (или ASCII)",
              "Обновить README"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Сломать: убрать VLAN filtering на bridge, проверить что изоляция пропала",
              "Вернуть",
              "Написать отчёт"
            ]
          }
        ],
        checkpoints: [
          { id: "w3c1", text: "Bridge с VLAN filtering работает", checked: false },
          { id: "w3c2", text: "Внутри VLAN 10 пинг есть, между VLAN 10 и 20 — нет", checked: false },
          { id: "w3c3", text: "tcpdump показывает 802.1Q tag", checked: false },
          { id: "w3c4", text: "Скрипты и документация на GitHub", checked: false }
        ]
      },
      {
        id: 4,
        title: "VLAN + Bridge — Продвинутый уровень",
        dates: "22–28 сен",
        readings: [
          "Rami Rosen \"Linux Kernel Networking\" глава 3 (bridging)",
          "Документация bridge vlan (iproute2)",
          "Статья: \"Linux bridge VLAN filtering\" (kernel.org)"
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Разобраться: VLAN-aware bridge vs VLAN-unaware",
              "Что такое PVID, tagged/untagged порты",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Создать стенд: 1 bridge, 4 namespace (2 в VLAN 10, 2 в VLAN 20)",
              "Настроить trunk-порт на router (несёт оба VLAN)",
              "Настроить router как inter-VLAN routing"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Проверить: внутри VLAN — пинг, между VLAN — через router",
              "tcpdump видно что пакеты идут через router",
              "Сломать: заблокировать inter-VLAN routing через iptables"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Написать скрипт",
              "Добавить troubleshooting-секцию в README",
              "Git commit"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Финальная проверка всех контрольных точек",
              "Написать отчёт за месяц 1",
              "Ретроспектива: что понял, что осталось непонятным"
            ]
          }
        ],
        checkpoints: [
          { id: "w4c1", text: "Inter-VLAN routing работает через router", checked: false },
          { id: "w4c2", text: "tcpdump на trunk-порту показывает оба VLAN", checked: false },
          { id: "w4c3", text: "Блокировка через iptables работает", checked: false },
          { id: "w4c4", text: "Все скрипты и документация на GitHub", checked: false },
          { id: "w4c5", text: "Месячная ретроспектива написана", checked: false }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "МЕСЯЦ 2 (Октябрь 2026)",
    subtitle: "Linux Networking — Продвинутый",
    weeks: [
      {
        id: 5,
        title: "NAT + conntrack — Основы",
        dates: "29 сен – 5 окт",
        readings: [
          "man 8 iptables (раздел NAT)",
          "man 8 conntrack (пакет conntrack-tools)",
          "Arch Wiki: \"iptables\" (раздел NAT)",
          "Статья: \"Netfilter connection tracking\" (kernel.org)"
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Разобраться: что такое NAT (SNAT, DNAT, MASQUERADE)",
              "Что такое conntrack (таблица состояний), зачем нужен",
              "Нарисовать схему прохождения пакета через netfilter",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Создать стенд: client (10.0.1.0/24) → router (SNAT) → \"internet\"",
              "Настроить SNAT: iptables -t nat -A POSTROUTING -s 10.0.1.0/24 -j MASQUERADE",
              "Проверить что client пингует \"internet\""
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Настроить DNAT (проброс порта): router:8080 → server:80",
              "Проверить curl через router",
              "Изучить conntrack -L — найти записи для своих соединений"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Написать скрипты",
              "Задокументировать каждое правило iptables (комментарии)",
              "Git commit"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Сломать: удалить правило SNAT, проверить что \"интернет\" пропал",
              "Проверить conntrack -F (сброс таблицы)",
              "Написать отчёт"
            ]
          }
        ],
        checkpoints: [
          { id: "w5c1", text: "SNAT работает (client выходит в \"интернет\")", checked: false },
          { id: "w5c2", text: "DNAT работает (проброс порта)", checked: false },
          { id: "w5c3", text: "conntrack -L показывает активные соединения", checked: false },
          { id: "w5c4", text: "Могу объяснить разницу SNAT vs DNAT vs MASQUERADE", checked: false }
        ]
      },
      {
        id: 6,
        title: "NAT + IPv6 Dual-Stack",
        dates: "6–12 окт",
        readings: [
          "man 8 ip6tables",
          "RFC 4291 (IPv6 Addressing Architecture) — skim",
          "Arch Wiki: \"IPv6\"",
          "Cloudflare Blog: \"IPv6 fundamentals\""
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Разобраться: IPv6 адреса (link-local, ULA, GUA)",
              "Чем NAT в IPv6 отличается от IPv4",
              "Что такое dual-stack",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "К существующему стенду добавить IPv6 адреса",
              "ip -6 addr add fd00:1::2/64 dev veth-c",
              "Настроить IPv6 маршрутизацию",
              "Проверить ping6 fd00:2::2"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Настроить dual-stack: оба протокола работают одновременно",
              "Проверить traceroute6",
              "Изучить NDP через ip -6 neigh",
              "Сравнить с ARP в IPv4"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Обновить скрипты (добавить IPv6)",
              "Обновить README",
              "Нарисовать dual-stack схему",
              "Git commit"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Сломать: отключить IPv6 на router",
              "sysctl net.ipv6.conf.all.disable_ipv6=1",
              "Написать отчёт"
            ]
          }
        ],
        checkpoints: [
          { id: "w6c1", text: "IPv6 пинг работает", checked: false },
          { id: "w6c2", text: "Dual-stack: IPv4 и IPv6 одновременно", checked: false },
          { id: "w6c3", text: "ip -6 neigh показывает NDP-таблицу", checked: false },
          { id: "w6c4", text: "Могу объяснить разницу ARP vs NDP", checked: false }
        ]
      },
      {
        id: 7,
        title: "Policy Routing + tc",
        dates: "13–19 окт",
        readings: [
          "man 8 ip-rule и man 8 ip-route (раздел policy)",
          "man 8 tc (traffic control)",
          "Arch Wiki: \"Traffic Control\"",
          "Статья: \"Linux Advanced Routing & Traffic Control HOWTO\" (tldp.org)"
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Разобраться: что такое policy routing",
              "Что такое tc (управление очередями, эмуляция задержек)",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Создать 2 таблицы маршрутизации",
              "echo \"100 isp1\" >> /etc/iproute2/rt_tables",
              "Настроить правило: трафик от client1 через isp1, от client2 — через isp2",
              "Проверить ip rule show и ip route show table isp1"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Настроить tc на veth: добавить задержку 100ms",
              "tc qdisc add dev veth-c root netem delay 100ms",
              "Проверить ping (RTT вырос на ~100ms)",
              "Добавить потерю пакетов 5%",
              "Проверить iperf3"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Написать скрипты для policy routing и tc",
              "Задокументировать",
              "Git commit"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Сломать: убрать policy rule, проверить что трафик пошёл через default",
              "Убрать tc, проверить что задержка вернулась",
              "Написать отчёт"
            ]
          }
        ],
        checkpoints: [
          { id: "w7c1", text: "ip rule show показывает кастомные правила", checked: false },
          { id: "w7c2", text: "Трафик от разных клиентов идёт разными путями", checked: false },
          { id: "w7c3", text: "tc эмулирует задержку и потери", checked: false },
          { id: "w7c4", text: "iperf3 показывает деградацию при tc", checked: false }
        ]
      },
      {
        id: 8,
        title: "VXLAN + Итоги Месяца 1-2",
        dates: "20–26 окт",
        readings: [
          "man 8 ip-link (раздел VXLAN)",
          "RFC 7348 (VXLAN) — skim, первые 3 раздела",
          "Cloudflare Blog: \"What is VXLAN\"",
          "Cilium docs: \"VXLAN overlay\""
        ],
        dailyTasks: [
          {
            day: "Пн",
            tasks: [
              "Разобраться: что такое overlay-сеть",
              "Зачем VXLAN (инкапсуляция L2 в L3)",
              "VNI (VXLAN Network Identifier)",
              "Нарисовать схему",
              "Написать резюме"
            ]
          },
          {
            day: "Вт",
            tasks: [
              "Создать 2 namespace (site-a, site-b) с разными подсетями",
              "Создать VXLAN туннель",
              "ip link add vxlan0 type vxlan id 42 remote 10.0.0.2 dstport 4789",
              "Назначить IP, проверить пинг через туннель"
            ]
          },
          {
            day: "Ср",
            tasks: [
              "Проверить tcpdump на физическом интерфейсе — увидеть VXLAN-инкапсуляцию",
              "Сравнить размер пакета внутри туннеля и снаружи (overhead ~50 байт)",
              "Проверить iperf3 через VXLAN"
            ]
          },
          {
            day: "Чт",
            tasks: [
              "Написать скрипты",
              "Задокументировать",
              "Обновить README",
              "Git commit"
            ]
          },
          {
            day: "Пт",
            tasks: [
              "Итоговая проверка за 2 месяца",
              "Собрать всё в один большой стенд: namespaces + VLAN + NAT + VXLAN",
              "Написать отчёт",
              "Ретроспектива"
            ]
          }
        ],
        checkpoints: [
          { id: "w8c1", text: "VXLAN туннель работает", checked: false },
          { id: "w8c2", text: "tcpdump показывает VXLAN-пакеты", checked: false },
          { id: "w8c3", text: "iperf3 через VXLAN показывает скорость", checked: false },
          { id: "w8c4", text: "Итоговый стенд работает", checked: false },
          { id: "w8c5", text: "Ретроспектива за 2 месяца написана", checked: false }
        ]
      }
    ]
  }
];

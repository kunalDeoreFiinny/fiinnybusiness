export interface Crop {
  id: string;
  name: string;
  image: string;
  description: string;
}

export const CROPS: Crop[] = [
  { 
    id: 'watermelon', 
    name: 'Watermelon', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSGbELbnV8HdsslJ8hy2mq0a_hvzZrr4cwUKHrze-GEeDpv0Z0VAvA62LryAUopIvuvGVeMWJJbVbRbtq1vKgcoaC4k3njelp3OPJb4_vjrijsdG-_1eEve_PojVdVNedf02IxptPKFjsUkGRH1oiP1H0007UHuQJ18mVTW7N6Vr0wdS7106fBV-qwwwXtBDWxaYcfvkouSyItxhdz24OL3GaUYJVj1YAyxMbObWYCQ7RpC1_QTpxN-wK8fDzDpx5JjUPaRwkLJq3m',
    description: 'Fresh, local watermelons. High sweetness and quality.'
  },
  { 
    id: 'wheat', 
    name: 'Wheat', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGRxeg57dLoYXGSyDjQg4KIlhXhDoSLcH2TL8JTunYEXVl92RlHqTVRxoaRdOAkh3zaNzYyWA_A6fqz_nGVpYX89iPffRc3YZiMWnP3sK_95HetWGqVfdRImiWjILpEm4QSjNlbAjMj-OUvIStUKdMz3rJIgBpfZfwS_bvvqnp4MW5nmL3clqHayheyeb4JjIMAQ-gLUSD5MwF4wfv6V6n8zzhE4j4TuAAZTe6ghT4RN968zaDf-5pElvcbSJgD-qRjSWhoK-bxv2E',
    description: 'Golden wheat varieties, locally sourced and processed.'
  },
  { 
    id: 'tomato', 
    name: 'Tomato', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqKjRa6JNKk1ATRrRh-34rnzxN5NuF1db88XkLpgwid9VCayDeG7-CfYbyq33aukNBgreqb0c5M1Int2-qanv5_m-SOu2lBMifHXZZH-RkGgsKGAFKGT4r5Nog_CeGGEI5cwu7us5a6k3pdYmXKuO71MT-e41ku3KL7OkdDlJTeQtkq8qzokwhrXf4vzscnmQVRktLp-RhAVdgE10R9kSDmAf-j8yl9-6ONkKTzkj3c4RrUIIUYJjM2l3q8EFdtQT0CPWTr3JIG98a',
    description: 'Ripe red tomatoes from nearby farms. Pesticide-free options available.'
  },
  { 
    id: 'cotton', 
    name: 'Cotton', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi13WleIFmuHicYHUY0W-rwufSddyMDo6kb2AcbrntT8BejZDYLjTxaKtV_Y7mnIsnnZJB27-jLhcDJJ-INGrThJKx-ezn-v1eICtCBg9KvmrOIjxCzqye2mi_tIn2fzO64bWu8QByBgH2JQTivKMjxsEsgphoj0fCIMsFB7enUvlyLg-6IkDTTWxfnEszM37GZrGUGaIDzJCwiztMcbaYmVPS8EIuSqQY0ewtQb8oZbCMTLeltwk9U7G9_lPwLTyFLt5WcDAd8f1r',
    description: 'High-quality cotton fiber. Direct from local ginning units.'
  },
];

const IPHONE_GALLERY = [
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXK1mnD-2zgfzHnAcihlNnP8SWS5aNpBep7ni4ypi3fMINUaEtQZb9lqmNalcPIDIDCnkD8lb6cg89VoJBZ-AhytO__v7naEbgbK9iAUg0yfc78Gvwtctq_fHqN16Xx1tPY4R9DUngKt5pr3HsYe1CoLtbqR3gbA05bDYHcdcVyIKYyjoCmQOIVoxb3prQuFkMl1sFTz9Zf_zD4EgiC8kcCNJoK8PETmyVL9Eenv1Zb1GELaIE3k6swA', labelAr: 'الرئيسية', labelEn: 'Front' },
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwuGVLNoqnZLfScUQDfi4srMOlSPgKxaudtKyJOa9v_jja0ZNcmchhTxmh44GpQQrlGX8V6-ytc2VpA7Rk8Y0HOwu64Ecfh6bk_cSf9YLW4o0ClBhZSOovPLJDzU5pMeKZqQLarxql0HjlfsXCwoeWEDzu7cmQWSs6jVPttNbrrLri6FFKMwsdQwSCM9B1vuNgf4_M_YuN1bzPX9ozrK02spHODCXr0L_GbYJYMHRdYJ8tLz6OjUiIA', labelAr: 'الخلفية', labelEn: 'Back' },
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC70uk86tT5eG9HBS88cwZrwEo2SsTCaA2PPpEeRQNde4g9DfVMAEH8mBPEa4qi1o4uQ5OZYj2TXXPWPfxGIaapXGMV8pMMl-eHkR842EVvHVgcMI3Mq3G9PCQcv3gFqWYs027Eu1_0ARtpcOlHwQO6rHAjjcuc46rqGqROj1BMGKkuVSNOvvQUSzvtbukzpZdgy7zrxldEU6xLjmFhuJOiukgg0_7gypuUY_IQGdgVnoyTS-o-d6OCTA', labelAr: 'الهيكل', labelEn: 'Frame' },
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6Sd1AiccoEkXHDZuUIafjbOA186zJJsIkmA5b6wPj3-hVTrqOq2E0zCVtFwaJnID1fN5ovfhVFD8Sn3ZQ1yg1N-5bzEvVlmj2cS3XKnb12Q59uV-bXrBW7IjQEfz6bjJSAfj2DyjSZXZgg-4477ep7IyEFHyc0T3uYE1mzlGLiwVMJAKlp3Bewqk4ixDno-jyu-rrD5axIuLCdnzVK7I6kqnfVFH1jThz9m0ZRcTJkuUel0Aantqpqg', labelAr: 'المنفذ', labelEn: 'Port' },
  { src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKPEQ3W_tjKLbrmX664IAW1Q4hV6IteYinzKPT6PaQuE_xD6KXg2ITG-Grtj4dZDOqP-8vjhrHqA9TIH6tvswij23ilhcswYZOU0hmrrE7-IITpKoGS-Gc7paUFK7X-EE-17iSYBeq8n178fLPsjmCkhFDjNnmehg6geRLg8Euc11y4UfnInqLZR8M-MGR4ZsL8LGJxnCXmmGTHUpEkl40PO81pNSBR8Ir-AlHXOT4e5Yz03wpY5Ldbg', labelAr: 'العلبة', labelEn: 'Box' }
];

const ACCESSORY_IMAGES = {
  case: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxZq-LuWjQez1v1mD4HgqLVqAtfSEHhgSnG18GsceY1UCpVc3IT91WiqDrUlL6Cou6HtHGjoiQhZAfWeFtizQVqzQ57A40Mqb_GQB0UmDGv4VCxJtqgGRsHr2gONp6N-K7pak0eR0WbXBKkImJ-xUt7ysxOqsgQkbhEfawPgVa_XJgw32bCcFd-vgcvY_lumgAdF32ZsJ7lDZKxsrczS2I8rLNgc_yIiMPLuLnwuiaV4VPYhdSRZRQXQ',
  charger: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCecUCJSiCZEVOAVLQniKGKSFsZZQw7_lz34P2u5QfDCjHhg8GwnLf9Bzf1a5De6VP5NQDnz97nz0ENin_7_bGV2_q7cOHyU3mZeEMn0QkHvIKuLX6dl2tQmW-zuy51IwfAZr-UvBAxw0fMIFp_HmIBZVodZHjxXTo84cGd3UP6gNOuyw6cKaE20uo2j33jeduzolSDfGp6Ffg3RZePUPXsaEd8LBN0onrdKOZoP8842RUIQBAee9Unfg',
  glass: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtvDeAFde6DsV9gQiFLYpl-JGA0hdtuIWLOUXYRjckWOhWv68feerdiA16MwGZL1cwqJMk15x0HVbWIiB9RmoBRusL-f2qAobo2cvy9H8XQrqfETSoJT7_01OAJJ72UmOtN5WBgiono_NeECdmA0wmgyZhRIVVKgUk_-7ljkXBttnJnAv9GSM0xsyEQ6nx84kFH7Jojg0UU4xN2BELiBGPqX9tshbUTrfnekeKJ3wA0gZzztGp2-kJqg'
};

// Reference profiles used only for products explicitly marked isDemo.
const PDP_PROFILES = {
  1: {
    sku: 'TP-IPH15P-NT-256',
    seriesAr: 'سلسلة آبل الرائدة',
    seriesEn: 'Apple flagship series',
    subtitleAr: 'شريحة 5G، سعة 256 جيجابايت، تيتانيوم طبيعي، معالج A17 Pro.',
    subtitleEn: '5G, 256GB, Natural Titanium, A17 Pro chip.',
    gallery: IPHONE_GALLERY,
    colors: [
      { nameAr: 'تيتانيوم طبيعي', nameEn: 'Natural Titanium', hex: '#9c958d' },
      { nameAr: 'تيتانيوم أزرق', nameEn: 'Blue Titanium', hex: '#2d3846' },
      { nameAr: 'تيتانيوم أبيض', nameEn: 'White Titanium', hex: '#f2f1ed' },
      { nameAr: 'تيتانيوم أسود', nameEn: 'Black Titanium', hex: '#393836' }
    ],
    storageOptions: [
      { id: '256', labelAr: '256 جيجابايت', labelEn: '256 GB', price: 4699 },
      { id: '512', labelAr: '512 جيجابايت', labelEn: '512 GB', price: 5299 },
      { id: '1024', labelAr: '1 تيرابايت', labelEn: '1 TB', price: 6099 }
    ],
    variants: [
      { type: 'new', price: 4699, labelAr: 'جديد كلياً (Sealed)', labelEn: 'Brand new sealed' },
      { type: 'refurbished', price: 3899, oldPrice: 4999, battery: 98, labelAr: 'مجدد معتمد A+', labelEn: 'Certified A+ refurbished', tagAr: 'الخيار الأوفر', tagEn: 'Best value' }
    ],
    specs: [
      {
        icon: 'memory',
        titleAr: 'الأداء والمعالج',
        titleEn: 'Performance',
        rows: [
          { labelAr: 'المعالج', labelEn: 'Chip', valueAr: 'Apple A17 Pro (3 نانومتر)', valueEn: 'Apple A17 Pro (3nm)' },
          { labelAr: 'الرسوميات', labelEn: 'GPU', valueAr: 'سداسي النوى مع Ray Tracing', valueEn: '6-core GPU with ray tracing' },
          { labelAr: 'الذاكرة', labelEn: 'RAM', valueAr: '8GB LPDDR5', valueEn: '8GB LPDDR5' }
        ]
      },
      {
        icon: 'smartphone',
        titleAr: 'الشاشة',
        titleEn: 'Display',
        rows: [
          { labelAr: 'النوع', labelEn: 'Type', valueAr: 'Super Retina XDR OLED', valueEn: 'Super Retina XDR OLED' },
          { labelAr: 'المقاس', labelEn: 'Size', valueAr: '6.1 بوصة 120Hz', valueEn: '6.1-inch 120Hz' },
          { labelAr: 'السطوع', labelEn: 'Brightness', valueAr: '2,000 شمعة', valueEn: '2,000 nits' }
        ]
      }
    ]
  },
  5: {
    sku: 'TP-S24U-256',
    seriesAr: 'سلسلة سامسونج الرائدة',
    seriesEn: 'Samsung flagship series',
    subtitleAr: 'قلم S Pen، كاميرا 200MP، شاشة Dynamic AMOLED 2X.',
    subtitleEn: 'S Pen, 200MP camera, Dynamic AMOLED 2X display.',
    colors: [
      { nameAr: 'تيتانيوم رمادي', nameEn: 'Titanium Gray', hex: '#6d7073' },
      { nameAr: 'تيتانيوم أسود', nameEn: 'Titanium Black', hex: '#1d1f21' },
      { nameAr: 'تيتانيوم بنفسجي', nameEn: 'Titanium Violet', hex: '#6b5b7a' }
    ],
    storageOptions: [
      { id: '256', labelAr: '256 جيجابايت', labelEn: '256 GB', price: 3999, oldPrice: 4299 },
      { id: '512', labelAr: '512 جيجابايت', labelEn: '512 GB', price: 4499, oldPrice: 4799 },
      { id: '1024', labelAr: '1 تيرابايت', labelEn: '1 TB', price: 5199 }
    ]
  },
  101: {
    sku: 'TP-IPH14PM-DP-256',
    seriesAr: 'مجدد معتمد من تيك برو',
    seriesEn: 'TechPro certified refurbished',
    subtitleAr: 'آيفون 14 برو ماكس بنفسجي عميق، بطارية 95%، فحص 40 نقطة.',
    subtitleEn: 'iPhone 14 Pro Max Deep Purple, 95% battery, 40-point inspection.',
    gallery: IPHONE_GALLERY.map((item, index) => (index === 0 ? { ...item, src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJQ7Kbf_imzAYLBmlN6sahHsItdRNAm-hIWBsrJ28teww7-sc1P7-z_A28E_0hZBhKFHFlTcMcR4KXGQ-Q8mi8KGh00QA1Mg01O5ZyM6ApKto4x9OJbiBFEnRXFqRfpdXbMcEP_R7ksMWMdK9qlK30bvOSoqZZsd9Ulc91v0fhTaN7qaVdmuoUZxDf0_r5WqKN0FJNBlAFnQCigogzNUgu3YNyFtw7yEogvIV-aVUPYC2ddGeDTHnncA' } : item)),
    colors: [{ nameAr: 'بنفسجي عميق', nameEn: 'Deep Purple', hex: '#5b3b6a' }],
    storageOptions: [
      { id: '256', labelAr: '256 جيجابايت', labelEn: '256 GB', price: 3250, oldPrice: 4800 },
      { id: '512', labelAr: '512 جيجابايت', labelEn: '512 GB', price: 3650, oldPrice: 5200 }
    ]
  }
};


'use strict';

// Реальные данные пока не переданы. Никаких цен, сроков, тиражей или заказчиков.
// Для подтверждённого проекта: isDemo:false, confirmed:true, реальные локальные images.
window.ICutPortfolioProjects = Object.freeze(
  ['laser', 'milling', 'plotter'].flatMap(technology => [
    {
      id: `${technology}-gallery-demo`, title: 'Фигурные элементы',
      technology, isDemo: true, confirmed: false, material: null,
      description: 'Фигурные элементы по заданному контуру. Форма, размеры и подходящий материал определяются по вашему макету и назначению изделия.',
      solution: null, quantity: null, deadline: null, price: null,
      images: [1, 2, 3, 4].map(i => `assets/portfolio-demo/scheme-${i}.svg`),
      imageAlt: [
        'Схема фигурного контура',
        'Схема отдельных элементов',
        'Схема раскладки элементов',
        'Схема криволинейного контура'
      ]
    },
    {
      id: `${technology}-single-demo`, title: 'Элементы макета',
      technology, isDemo: true, confirmed: false, material: null,
      description: 'Отдельные элементы для компоновки изделия. Возможность изготовления и способ обработки зависят от материала, размеров и задачи.',
      solution: null, quantity: null, deadline: null, price: null,
      images: ['assets/portfolio-demo/scheme-2.svg'],
      imageAlt: ['Схема элементов изделия']
    },
    {
      id: `${technology}-empty-demo`, title: 'Контур изделия',
      technology, isDemo: true, confirmed: false, material: null,
      description: 'Раскрой по контуру из макета или эскиза. Поможем уточнить геометрию детали и исходные данные для расчёта.',
      solution: null, quantity: null, deadline: null, price: null,
      images: [], imageAlt: []
    }
  ]).map(project => Object.freeze({...project, images:Object.freeze(project.images), imageAlt:Object.freeze(project.imageAlt)}))
);

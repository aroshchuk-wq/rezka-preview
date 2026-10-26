'use strict';

// Реальные данные пока не переданы. Никаких цен, сроков, тиражей или заказчиков.
// Для подтверждённого проекта: isDemo:false, confirmed:true, реальные локальные images.
window.ICutPortfolioProjects = Object.freeze(
  ['laser', 'milling', 'plotter'].flatMap(technology => [
    {
      id: `${technology}-gallery-demo`, title: 'Фигурные элементы',
      technology, isDemo: true, confirmed: false, material: null,
      description: 'Пример интерфейса для просмотра нескольких изображений. Показаны условные схемы, а не фотографии выполненного заказа. Данные реального проекта ещё не переданы.',
      solution: null, quantity: null, deadline: null, price: null,
      images: [1, 2, 3, 4].map(i => `assets/portfolio-demo/scheme-${i}.svg`),
      imageAlt: [
        'Условная схема контура — демонстрация интерфейса, не фотография работы',
        'Условная схема отдельных элементов — демонстрация интерфейса',
        'Условная схема раскладки — демонстрация интерфейса',
        'Условная схема криволинейного контура — демонстрация интерфейса'
      ]
    },
    {
      id: `${technology}-single-demo`, title: 'Элементы макета',
      technology, isDemo: true, confirmed: false, material: null,
      description: 'Демонстрация просмотра одного изображения. Условная графика не подтверждает изготовление изделия или возможности производства.',
      solution: null, quantity: null, deadline: null, price: null,
      images: ['assets/portfolio-demo/scheme-2.svg'],
      imageAlt: ['Условная схема элементов, не выполненный заказ i-cut.pro']
    },
    {
      id: `${technology}-empty-demo`, title: 'Контур изделия',
      technology, isDemo: true, confirmed: false, material: null,
      description: 'Так выглядит окно до получения фотографий. Название заказа, материал, описание выполненных работ и коммерческие данные появятся только после подтверждения заказчиком.',
      solution: null, quantity: null, deadline: null, price: null,
      images: [], imageAlt: []
    }
  ]).map(project => Object.freeze({...project, images:Object.freeze(project.images), imageAlt:Object.freeze(project.imageAlt)}))
);

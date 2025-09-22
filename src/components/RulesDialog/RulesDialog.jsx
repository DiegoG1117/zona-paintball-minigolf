import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKeenSlider } from 'keen-slider/react'
import './RulesDialog.css'
import 'keen-slider/keen-slider.min.css'
import rule1 from '../../img/Rule1.png'
import rule2 from '../../img/Rule2.png'
import rule3 from '../../img/Rule3.png'
import rule4 from '../../img/Rule4.png'

function RulesDialog({ open, onClose }) {
   const navigate = useNavigate()
   const [activeIndex, setActiveIndex] = useState(0)
   const [ref, instanceRef] = useKeenSlider(
      {
         initial: 0,
         slideChanged(s) {
            setActiveIndex(s.track.details.rel)
         },
         rubberband: false,
         loop: false,
         renderMode: 'precision',
         defaultAnimation: { duration: 280, easing: (t) => 1 - Math.pow(1 - t, 2) },
         slides: {
            origin: 'auto',
            perView: 1,
            spacing: 0,
         },
      },
      []
   )

   const slides = [
      {
         id: 0,
         title: '#1 Menos golpes, mejor',
         titleClass: 'title--intro',
         bgClass: 'slide--one',
         text:
            'Cada golpe suma +1 punto. Tu objetivo es llevar la bola al hoyo con la menor cantidad de golpes posible. Juega pensando el tiro y busca precisión antes que fuerza.',
         image: rule1,
      },
      {
         id: 1,
         title: '#2 Fuera de pista (+3)',
         titleClass: 'title--how',
         bgClass: 'slide--two',
         text:
            'Si la bola sale por fuera de la pista, debes sumarte +3 puntos. Colócala nuevamente en el punto de salida o en el último punto válido indicado por el grupo.',
         image: rule2,
      },
      {
         id: 2,
         title: '#3 Pegada al muro',
         titleClass: 'title--tips',
         bgClass: 'slide--three',
         text:
            'Si la bola queda muy pegada a un muro, muévela solo la distancia del palo de golf para poder golpear mejor. No hay penalización por este ajuste.',
         image: rule3,
      },
      {
         id: 3,
         title: '#4 Puntuación en la app',
         titleClass: 'title--how',
         bgClass: 'slide--four',
         text:
            'Lleva el marcador desde esta aplicación: suma un punto por cada golpe y recuerda añadir +3 si sales de la pista. También puedes agregar tantos jugadores como quieras.',
         image: rule4,
      },
   ]

   const goPrev = () => instanceRef.current?.prev()
   const goNext = () => instanceRef.current?.next()

   useEffect(() => {
      if (!open) {
         setActiveIndex(0)
         instanceRef.current?.moveToIdx(0, true)
      }
   }, [open, instanceRef])

   if (!open) return null

   const handleContinue = () => {
      onClose?.()
      navigate('/newplayers')
   }

   return (
      <div className="rulesDialogBackdrop" onClick={onClose}>
         <div className="rulesDialogContent" onClick={(e) => e.stopPropagation()}>
            <div className="rulesDialogHeader">
               <h1>Reglas</h1>
               <button className="rulesDialogClose buttonClose" aria-label="Cerrar" onClick={onClose}>×</button>
            </div>

            <div className="rulesDialogCarousel">
               <div ref={ref} className="keen-slider rulesDialogSlides" style={{ height: '100%' }}>
                  {slides.map((slide) => (
                     <div key={slide.id} className={`keen-slider__slide rulesDialogSlide ${slide.bgClass}`}>
                        <div className="rulesDialogSlidesText">
                           <h2 className={`rulesDialogTitle ${slide.titleClass}`}>{slide.title}</h2>
                           <p className="ruleDescription">{slide.text}</p>
                        </div>
                        <div className="rulesDialogSlidesImage">
                           {slide.image ? <img src={slide.image} className={`imgRules imgRules--${slide.id}`} /> : null}
                        </div>
                     </div>
                  ))}
               </div>
               <button
                  className="rulesDialogArrow rulesDialogArrow--left"
                  aria-label="Anterior"
                  onClick={goPrev}
                  disabled={activeIndex === 0}
               >
                  ◀
               </button>
               <button
                  className="rulesDialogArrow rulesDialogArrow--right"
                  aria-label="Siguiente"
                  onClick={goNext}
                  disabled={activeIndex === slides.length - 1}
               >
                  ▶
               </button>
            </div>

            <div className="rulesDialogDots" role="tablist" aria-label="Paginación de reglas">
               {slides.map((_, i) => (
                  <button
                     key={i}
                     className={`rulesDialogDot ${i === activeIndex ? 'is-active' : ''}`}
                     aria-current={i === activeIndex}
                     aria-label={`Ir a la diapositiva ${i + 1}`}
                     onClick={() => instanceRef.current?.moveToIdx(i)}
                  />
               ))}
            </div>

            <div className="rulesDialogActions">
               {activeIndex === slides.length - 1 ? (
                  <button className="rulesDialogContinue" onClick={handleContinue}>Continuar</button>
               ) : null}
            </div>
         </div>
      </div>
   )
}

export default RulesDialog



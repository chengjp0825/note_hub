/// <reference types="vite/client" />
// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import './style.css'
import './custom.css'

const KnowledgeGraph = defineAsyncComponent(() => import('../components/KnowledgeGraph.vue'))

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('KnowledgeGraph', KnowledgeGraph)
    app.component(
      'Mermaid',
      defineAsyncComponent(() => import('../components/Mermaid.vue'))
    )

    if (!import.meta.env.SSR) {
      const syncQuestionBankSidebar = () => {
        requestAnimationFrame(() => {
          const current = new URL(window.location.href)
          const isQuestionBank = current.pathname.replace(/\/$/, '') === '/question-bank'
          document.body.classList.toggle('question-bank-sidebar-ready', isQuestionBank)

          if (!isQuestionBank) return

          const activeRoles = new Set(
            (current.searchParams.get('role') || '')
              .split(',')
              .map((role) => role.trim())
              .filter(Boolean)
          )
          const activeValues = {
            topic: current.searchParams.get('topic'),
            tag: current.searchParams.get('tag'),
            company: current.searchParams.get('company')
          }
          const hasFilter = activeRoles.size > 0 || Object.values(activeValues).some(Boolean)

          document.querySelectorAll<HTMLElement>('.VPSidebarItem.question-bank-current')
            .forEach((item) => item.classList.remove('question-bank-current'))

          document.querySelectorAll<HTMLAnchorElement>('.VPSidebarItem .link[href]')
            .forEach((link) => {
              const target = new URL(link.href, window.location.origin)
              if (target.pathname.replace(/\/$/, '') !== '/question-bank') return

              const linkValues = {
                topic: target.searchParams.get('topic'),
                role: target.searchParams.get('role'),
                tag: target.searchParams.get('tag'),
                company: target.searchParams.get('company')
              }
              const isCurrent = hasFilter
                ? Boolean(
                    (linkValues.role && activeRoles.has(linkValues.role)) ||
                    (linkValues.topic && linkValues.topic === activeValues.topic) ||
                    (linkValues.company && linkValues.company === activeValues.company) ||
                    (linkValues.tag && linkValues.tag === activeValues.tag)
                  )
                : !linkValues.role && !linkValues.topic && !linkValues.company && !linkValues.tag

              if (isCurrent) {
                const item = link.closest<HTMLElement>('.VPSidebarItem')
                item?.classList.add('question-bank-current')
                item?.parentElement
                  ?.closest<HTMLElement>('.VPSidebarItem.collapsible')
                  ?.classList.remove('collapsed')
              }
            })
        })
      }

      const syncQuestionBankSidebarFromFilter = () => syncQuestionBankSidebar()

      const previousAfterRouteChanged = router.onAfterRouteChanged
      router.onAfterRouteChanged = async (to) => {
        await previousAfterRouteChanged?.(to)
        syncQuestionBankSidebar()
      }
      window.addEventListener('question-bank-filter-change', syncQuestionBankSidebarFromFilter)
      window.addEventListener('popstate', syncQuestionBankSidebarFromFilter)
      syncQuestionBankSidebar()

      import('medium-zoom').then((mediumZoom) => {
        mediumZoom.default('img', {
          margin: 24,
          background: 'rgba(0,0,0,0.85)'
        })
      })
    }
  }
}

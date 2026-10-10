import { useEffect, useState } from 'react'
import { useMatch } from '../../context/MatchContext.jsx'
import { hasSeenRules, markRulesSeen } from '../../game/rulesSeen.js'
import RulesDialog from '../RulesDialog/RulesDialog.jsx'

function OnlineRulesOnce() {
  const { isOnlineMatch } = useMatch()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (isOnlineMatch && !hasSeenRules()) setOpen(true)
  }, [isOnlineMatch])

  const close = () => {
    markRulesSeen()
    setOpen(false)
  }

  if (!isOnlineMatch) return null
  return <RulesDialog open={open} onClose={close} variant="online" />
}

export default OnlineRulesOnce

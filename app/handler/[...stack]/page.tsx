import { StackHandler } from '@stackframe/stack'
import { getStackServerApp } from '@/lib/stack'

export default function Handler(props: unknown) {
  return <StackHandler fullPage app={getStackServerApp()} routeProps={props} />
}

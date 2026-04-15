import 'dotenv/config'
import { PrismaClient } from '../lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding StackZero database...')

  // ── Users ────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { id: 'seed-user-001' },
      update: {},
      create: { id: 'seed-user-001', name: 'Aryan Mehta', email: 'aryan@example.com' },
    }),
    prisma.user.upsert({
      where: { id: 'seed-user-002' },
      update: {},
      create: { id: 'seed-user-002', name: 'Priya Sharma', email: 'priya@example.com' },
    }),
    prisma.user.upsert({
      where: { id: 'seed-user-003' },
      update: {},
      create: { id: 'seed-user-003', name: 'Dev Patel', email: 'dev@example.com' },
    }),
    prisma.user.upsert({
      where: { id: 'seed-user-004' },
      update: {},
      create: { id: 'seed-user-004', name: 'Riya Joshi', email: 'riya@example.com' },
    }),
    prisma.user.upsert({
      where: { id: 'seed-user-005' },
      update: {},
      create: { id: 'seed-user-005', name: 'Kiran Rao', email: 'kiran@example.com' },
    }),
  ])
  console.log(`  ✓ ${users.length} users`)

  // ── Projects ─────────────────────────────────────────────────────────────
  const project1 = await prisma.project.upsert({
    where: { id: 'seed-project-001' },
    update: {},
    create: {
      id: 'seed-project-001',
      title: 'StackZero Platform',
      description: 'The club\'s core operating system — project management, contribution tracking, and event coordination for Software Engineering Club members.',
      stack: ['Next.js', 'PostgreSQL', 'Prisma', 'TypeScript', 'Tailwind CSS'],
      status: 'ACTIVE',
      ownerId: 'seed-user-001',
      members: {
        create: [
          { userId: 'seed-user-001', role: 'owner' },
          { userId: 'seed-user-002', role: 'admin' },
          { userId: 'seed-user-003', role: 'member' },
        ],
      },
    },
  })

  const project2 = await prisma.project.upsert({
    where: { id: 'seed-project-002' },
    update: {},
    create: {
      id: 'seed-project-002',
      title: 'ML Paper Replication Lab',
      description: 'Collaborative effort to reproduce state-of-the-art ML research papers, validate results, and publish reproducibility reports.',
      stack: ['Python', 'PyTorch', 'Jupyter', 'Weights & Biases', 'HuggingFace'],
      status: 'ACTIVE',
      ownerId: 'seed-user-002',
      members: {
        create: [
          { userId: 'seed-user-002', role: 'owner' },
          { userId: 'seed-user-004', role: 'member' },
          { userId: 'seed-user-005', role: 'member' },
        ],
      },
    },
  })

  const project3 = await prisma.project.upsert({
    where: { id: 'seed-project-003' },
    update: {},
    create: {
      id: 'seed-project-003',
      title: 'Campus DevOps Infra',
      description: 'Kubernetes-based infrastructure for hosting club projects with CI/CD pipelines, monitoring, and automated deployments.',
      stack: ['Kubernetes', 'Docker', 'Terraform', 'Prometheus', 'GitHub Actions'],
      status: 'ACTIVE',
      ownerId: 'seed-user-003',
      members: {
        create: [
          { userId: 'seed-user-003', role: 'owner' },
          { userId: 'seed-user-001', role: 'admin' },
        ],
      },
    },
  })

  await prisma.project.upsert({
    where: { id: 'seed-project-004' },
    update: {},
    create: {
      id: 'seed-project-004',
      title: 'Open Source Contribution Tracker',
      description: 'Aggregates and visualizes each member\'s open-source contributions across GitHub, GitLab, and Bitbucket.',
      stack: ['React', 'GraphQL', 'GitHub API', 'Recharts'],
      status: 'PLANNING',
      ownerId: 'seed-user-004',
      members: {
        create: [{ userId: 'seed-user-004', role: 'owner' }],
      },
    },
  })
  console.log(`  ✓ 4 projects`)

  // ── Contributions ─────────────────────────────────────────────────────────
  const contribData = [
    { projectId: project1.id, userId: 'seed-user-001', type: 'commit'  as const, message: 'Implement Prisma schema with all core models and relations' },
    { projectId: project1.id, userId: 'seed-user-002', type: 'review'  as const, message: 'Code review: API route handlers — suggested typed params over any assertions' },
    { projectId: project1.id, userId: 'seed-user-003', type: 'commit'  as const, message: 'Add Framer Motion stagger animations to projects grid' },
    { projectId: project1.id, userId: 'seed-user-001', type: 'fix'     as const, message: 'Fix cookie not being set on first anonymous sign-in' },
    { projectId: project1.id, userId: 'seed-user-002', type: 'update'  as const, message: 'Update EventsGrid to handle past events gracefully' },
    { projectId: project1.id, userId: 'seed-user-003', type: 'commit'  as const, message: 'Implement dashboard stats with real PostgreSQL aggregates' },
    { projectId: project2.id, userId: 'seed-user-002', type: 'commit'  as const, message: 'Reproduce LoRA fine-tuning from Hu et al. 2021 — results within 0.3% of paper' },
    { projectId: project2.id, userId: 'seed-user-004', type: 'fix'     as const, message: 'Fix CUDA OOM on A100 for batch size > 32 — gradient checkpointing enabled' },
    { projectId: project2.id, userId: 'seed-user-005', type: 'update'  as const, message: 'Switch from manual training loop to Hugging Face Trainer for consistency' },
    { projectId: project2.id, userId: 'seed-user-002', type: 'review'  as const, message: 'Review replication methodology for Attention Is All You Need baseline' },
    { projectId: project3.id, userId: 'seed-user-003', type: 'commit'  as const, message: 'Set up K3s cluster on bare-metal nodes — 3 workers, 1 control plane' },
    { projectId: project3.id, userId: 'seed-user-001', type: 'commit'  as const, message: 'Configure Prometheus + Grafana dashboards for pod health monitoring' },
    { projectId: project3.id, userId: 'seed-user-003', type: 'fix'     as const, message: 'Resolve persistent volume claim crash on node restart' },
  ]

  for (const c of contribData) {
    await prisma.contribution.create({ data: c })
  }
  console.log(`  ✓ ${contribData.length} contributions`)

  // ── Events ────────────────────────────────────────────────────────────────
  const now = new Date()
  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: 'seed-event-001' },
      update: {},
      create: {
        id: 'seed-event-001',
        title: 'Build Night #12 — Systems Edition',
        description: 'An intensive evening sprint focused on low-level systems programming. Bring your OS, networking, or compiler project and ship something by midnight.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 18, 0),
        location: 'Lab 304, CS Block',
        capacity: 40,
        tags: ['systems', 'cpp', 'rust'],
      },
    }),
    prisma.event.upsert({
      where: { id: 'seed-event-002' },
      update: {},
      create: {
        id: 'seed-event-002',
        title: 'ML Reading Group — Transformers Deep Dive',
        description: 'Weekly paper reading session. This week: Llama 3 architecture walkthrough + attention mechanism optimizations in Flash Attention 3.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 9, 16, 30),
        location: 'Seminar Room 101',
        capacity: 25,
        tags: ['ml', 'transformers', 'reading-group'],
      },
    }),
    prisma.event.upsert({
      where: { id: 'seed-event-003' },
      update: {},
      create: {
        id: 'seed-event-003',
        title: 'Open Source Sprint Day',
        description: 'Pick a real-world open source project, find a good first issue, and get your PR merged — with mentoring from senior club members throughout the day.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 9, 0),
        location: 'Innovation Hub, Building A',
        capacity: 60,
        tags: ['open-source', 'mentoring', 'full-day'],
      },
    }),
    prisma.event.upsert({
      where: { id: 'seed-event-004' },
      update: {},
      create: {
        id: 'seed-event-004',
        title: 'Docker & Kubernetes Workshop',
        description: 'Hands-on containerization fundamentals: writing production Dockerfiles, Compose setups, and deploying a multi-service app to a Kubernetes cluster.',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21, 14, 0),
        location: 'Lab 204, CS Block',
        capacity: 35,
        tags: ['devops', 'docker', 'kubernetes'],
      },
    }),
  ])
  console.log(`  ✓ ${events.length} events`)

  // ── Event Registrations ───────────────────────────────────────────────────
  const regData = [
    { eventId: 'seed-event-001', userId: 'seed-user-001' },
    { eventId: 'seed-event-001', userId: 'seed-user-003' },
    { eventId: 'seed-event-001', userId: 'seed-user-005' },
    { eventId: 'seed-event-002', userId: 'seed-user-002' },
    { eventId: 'seed-event-002', userId: 'seed-user-004' },
    { eventId: 'seed-event-003', userId: 'seed-user-001' },
    { eventId: 'seed-event-003', userId: 'seed-user-002' },
    { eventId: 'seed-event-003', userId: 'seed-user-003' },
    { eventId: 'seed-event-004', userId: 'seed-user-005' },
  ]

  for (const r of regData) {
    await prisma.eventRegistration.upsert({
      where: { eventId_userId: r },
      update: {},
      create: r,
    })
  }
  console.log(`  ✓ ${regData.length} event registrations`)

  console.log('\n✅ Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

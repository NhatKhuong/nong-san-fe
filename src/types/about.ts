/** Một cột mốc trong dòng thời gian của cửa hàng. */
export interface Milestone {
  year: string
  title: string
  description: string
}

/** Một con số nổi bật ("5 nông trại đối tác"). */
export interface AboutStat {
  value: string
  label: string
}

/** Một cam kết với khách hàng. */
export interface Commitment {
  title: string
  description: string
}

export interface AboutContent {
  heroImage: string
  heroTitle: string
  heroDescription: string
  storyTitle: string
  /** Các đoạn văn của phần câu chuyện thương hiệu. */
  storyParagraphs: string[]
  storyImage: string
  stats: AboutStat[]
  milestones: Milestone[]
  commitments: Commitment[]
}

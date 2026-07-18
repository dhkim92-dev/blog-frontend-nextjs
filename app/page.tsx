import Image from "next/image";
import "./home-view.css";

export const revalidate = 3600;

const profileTags = ["#BACKEND", "#INFRA", "#MSA"];

const profileSkills = ["Spring Boot", "NestJS", "FastAPI", "Kubernetes"];

const majorSkills = [
  { src: "/skills/major/spring.svg", alt: "Spring" },
  { src: "/skills/major/kubernetes.svg", alt: "Kubernetes" },
  { src: "/skills/major/postgresql.svg", alt: "PostgreSQL" },
  { src: "/skills/major/mysql.svg", alt: "MySQL" },
  { src: "/skills/major/redis.svg", alt: "Redis" },
  { src: "/skills/major/aws.svg", alt: "AWS" },
  { src: "/skills/major/jenkins.png", alt: "Jenkins" },
];

const availableSkills = [
  { src: "/skills/available/nestjs.svg", alt: "NestJS" },
  { src: "/skills/available/fastapi.svg", alt: "FastAPI" },
  { src: "/skills/available/mongodb.png", alt: "MongoDB" },
  { src: "/skills/available/kafka.svg", alt: "Kafka" },
  { src: "/skills/available/elasticsearch.svg", alt: "Elasticsearch" },
];

const timelineData = [
  {
    teamName: "Team Respect Me",
    span: { from: "2024", to: "NOW" },
    position: "Backend & Infra Engineer",
    skills: ["Spring Boot", "Spring Batch", "FCM", "K8S", "Apache Kafka"],
    tasks: [
      "Architect MSA based Service System.",
      "Develop Backend APIs",
      "Develop batch application to send peoridical Push Notifications",
      "Develop Infrastructure based on Kubernetes",
    ],
  },
  {
    teamName: "Team Bokki",
    span: { from: "2023", to: "2024" },
    position: "Backend & Infra Engineer",
    skills: ["Spring Boot", "AWS EC2", "FCM", "GCP Cloud Function"],
    tasks: [
      "Develop Backend API for Bokki Application",
      "Develop Infrastructure for Service.",
    ],
  },
  {
    teamName: "Nalbi Company Inc",
    span: { from: "2022", to: "2023" },
    position: "Backend & Infra Engineer",
    skills: [
      "Spring Boot",
      "NestJS",
      "Auth0",
      "AWS SNS, SQS, Lambda, EMC, EKS",
      "MongoDB",
      "Postgres",
      "Socket.IO",
      "Electron",
      "Unity",
    ],
    tasks: [
      "Developed V-Tuber motion capture software backend",
      "Socket.IO based motion data communication between Unity & Electron",
      "Developed V-Tuber Shortform Platform API & Infrastructure",
    ],
  },
  {
    teamName: "Autosemantics Inc",
    span: { from: "2020", to: "2022" },
    position: "Senior Researcher",
    skills: ["Embeded Linux", "Tensorflow", "Python", "FastAPI", "EKS", "Lambda"],
    tasks: [
      "Developed&Operated AI based Supplier Recommendation System for MRO company",
      "Developed Building Energy Management System",
      "Developed Health Coach service backend, Android demo application",
      "Developed AI based Demand prediction for Electronic Kickboard rental company",
      "Developed DAQ Embeded Linux system for Samsung Onyang, Hwachun, Hyundai Autoever",
    ],
  },
  {
    teamName: "University of Seoul, Graphics Laboratory",
    span: { from: "2015", to: "2018" },
    position: "Master's Degree course",
    skills: ["OpenCL", "CUDA", "C++", "Python"],
    tasks: [
      "Research about surface reconstruction algorithm",
      "Marching Tetrahedral on BCC Coordinates system",
    ],
  },
];

type SkillImage = {
  src: string;
  alt: string;
};

function SkillGrid({ items }: { items: SkillImage[] }) {
  return (
    <div className="home-view-skill-grid">
      {items.map(({ src, alt }) => (
        <div
          key={src}
          className={`home-view-skill-image${alt === "Spring" ? " is-spring" : ""}`}
        >
          <Image src={src} alt={alt} width={72} height={72} />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <section className="home-view-root">
      <div className="home-view-profile">
        <div className="home-view-section-inner">
          <div className="home-view-profile-top">
            <div className="home-view-profile-summary">
              <h1>Dohoon Kim</h1>
              <div className="home-view-profile-tags">
                <span className="tag">{profileTags.join(" ")}</span>
              </div>
              <div className="home-view-profile-skills">
                {profileSkills.map((skill) => (
                  <span key={skill} className="skill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="home-view-profile-photo">
              <Image
                src="/dohoon-kim.png"
                alt="Dohoon Kim"
                width={240}
                height={240}
                priority
              />
            </div>
          </div>
          <div className="home-view-profile-description">
            <p>
              Welcome, I&apos;m Dohoon Kim. I&apos;ve continued my four-year journey as
              a software developer. Mainly, worked as a web backend, but also
              built service infrastructure. Recently, I&apos;m interested in topics
              such as high-availability system design in massive traffic
              environments, and Domain Driven Design. Excluding the field I am
              working in, I also have technology for embedded systems and
              graphics technologies such as OpenGL and Vulkan.
            </p>
          </div>
        </div>
      </div>

      <div className="home-view-skills">
        <div className="home-view-section-inner">
          <div className="home-view-section-header">
            <h2>Skills</h2>
          </div>
          <div className="home-view-skill-label">Major</div>
          <SkillGrid items={majorSkills} />
          <div className="home-view-skill-label">Available</div>
          <SkillGrid items={availableSkills} />
        </div>
      </div>

      <div className="home-view-timeline">
        <div className="home-view-section-inner">
          <div className="home-view-timeline-root">
            <div className="home-view-timeline-header">
              <h2>Timeline</h2>
            </div>
            <div className="home-view-timeline-summary">
              <div className="box">
                4+
                <br />
                Years
              </div>
              <div className="box">
                10+
                <br />
                Projects
              </div>
              <div className="box">Backend</div>
            </div>
            <div className="home-view-timeline-main">
              {timelineData.map((item) => (
                <div
                  key={`${item.teamName}-${item.span.from}`}
                  className="horizontal-container"
                >
                  <div className="left-cell">
                    <h3>
                      {item.span.from}-{item.span.to}
                    </h3>
                  </div>
                  <div className="right-cell">
                    <h3>{item.teamName}</h3>
                    <h4>{item.position}</h4>
                    <div>{item.skills.join(", ")}</div>
                    <ul>
                      {item.tasks.map((task) => (
                        <li key={`${item.teamName}-${task}`}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

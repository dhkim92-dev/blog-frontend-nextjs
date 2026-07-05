import type { ResumeDetailDto, SaveResumeRequestDto } from "./resume-types";

type ApiResponse<TPayload> = {
  status: number;
  payload: TPayload;
  message: string;
  code: string;
};

type ResumeSeed = ResumeDetailDto;

const legacyResumeContent = `# 김도훈

백엔드 엔지니어입니다. 운영 환경에서 지속 가능한 구조와 배포 흐름을 선호합니다.

## Summary

- Spring Boot 기반 API 설계 및 운영
- Kafka, Redis, PostgreSQL 중심의 서비스 안정화 경험
- Kubernetes, Terraform, CI/CD 파이프라인 운영 경험

## Experience

### Backend Engineer

- 도메인 경계를 기준으로 서비스 모듈을 정리했습니다.
- 장애 이후 재현 가능한 회고 문서를 만들고 배포 체크리스트를 정비했습니다.
- 캐시와 DB 일관성 문제를 추적하고 점진적으로 롤아웃했습니다.

## Skills

- Kotlin, Java, TypeScript
- Spring Boot, WebFlux, JPA
- PostgreSQL, Redis, Kafka
- Docker, Kubernetes, Terraform
`;

const initialResumeSeed: ResumeSeed = {
  id: "57ec970f-7cee-4d51-82a5-f1f2fa11f001",
  content: `# Dohoon Kim

Dongdaemun-gu, Seoul, 02492  
Mobile: +8210-2405-9884  
Mail: [dhkim92.dev@gmail.com](mailto:dhkim92.dev@gmail.com)  
[LinkedIn](https://www.linkedin.com/in/%EB%8F%84%ED%9B%88-%EA%B9%80-1a9a1322b) · [Github](https://github.com/dhkim92-dev) · [Homepage](https://www.dohoon-kim.kr)

## HIGHLIGHTS

- Spring Boot, FastAPI, NestJS를 활용한 웹 백엔드 개발 4년
- 알람 특화 어플리케이션 백엔드 개발 & 인프라 구축
- 면접 복기 어플리케이션 보끼 개발
- V-tuber 숏폼 플랫폼 백엔드 및 인프라 개발
- V-tuber 모션 캡쳐 소프트웨어 액션맨 통신 백엔드 개발
- 인공지능 기반 MRO 업체 공급사 추천 시스템 개발 리드 및 운영

## TECHNOLOGY STACKS

- 프로그래밍 언어: Java, Kotlin, Typescript, Python, C/C++
- 웹 백엔드: Spring Boot(JVM), NestJS, FastAPI
- 웹 프론트엔드: React
- 관계형 데이터베이스: PostgreSQL, MySQL
- NoSQL: Redis, MongoDB
- AWS: EC2, EKS, SQS, Cloud Front, S3, Lambda
- GCP: FCM, Cloud Functions
- 모니터링: ELK Stack, Grafana
- 컨테이너 & 오케스트레이션: Docker, Kubernetes
- CI/CD: Jenkins, Microsoft Azure Devops
- 그래픽스: OpenCL, CUDA, Vulkan, OpenGL

## EDUCATIONS

### 서울 시립 대학교 일반 대학원 | 2015.09-2018.02

컴퓨터 과학과, 컴퓨터 그래픽스 석사  
CGPA: 4.0/4.5

- 체심 입방 좌표계 마칭 기법의 최적화 연구
- GPGPU 최적화 연구
- 스칼라 필드 데이터 표면 복구 기법 연구

### 서울 시립 대학교 | 2011.03-2015.08

컴퓨터 과학부, 학사  
CGPA: 3.01/4.5

## PROFESSIONAL EXPERIENCES

### (주) 날비 컴퍼니 | 2022.09-2023.07

웹 백엔드 개발자

#### 버추얼 휴먼 숏폼 VOD 플랫폼 개발 | 2023.04-2023.07

사용 기술: Spring Boot, Express, FCM, Socket IO, Auth0, AWS SQS, Redis, MongoDB, PostgreSQL

- 인증, 사용자관리, 피드, 팔로우, 알림 CRUD API 개발
- Auth0 인증 서비스 연동
- EKS 기반 서비스 인프라 구축
- 영상 HLS 스트리밍 변환 파이프라인 설계 및 구축
- CDN 구축
- 서비스 모니터링 환경 구축
- CI/CD 파이프라인 구축

#### V-Tuber 모션 캡처 소프트웨어 개발 | 2022.09-2023.02

링크: [https://www.actionman.ai](https://www.actionman.ai)  
사용 기술: React, Electron, ExpressJS, Socket.IO, AWS

- IOS APP와 Unity 간의 모션 데이터 송수신 중계 Socket.IO 서버 개발 및 최적화
- 사용자 인터페이스 개발
- 사용자 회원가입, 인증, 아바타 관리 서비스 개발
- Electron 어플리케이션 배포 서명 파이프라인 구축

### 오토시맨틱스(주) | 2020.01-2022.08

선임 연구원

#### 건물 에너지 관리 시스팀 모니터링 서비스 개발 | 2022.01-2022.08

링크: [https://pascal.autosemantics.co.kr](https://pascal.autosemantics.co.kr)  
사용 기술: Spring boot, Express, Kafka, Zigbee, etc

- 오픈소스 IoT 플랫폼 Thingsboard 커스텀
- 서비스 건물 대상 내부 게이트웨이 구축
- Zigbee 프로토콜 및 게이트웨이 커넥터 인터페이스 구현
- 건물 내 센서 데이터 수집 및 전송 프로세스 구축
- 내부 CCTV 스트리밍 환경 구축

#### MRO 업체 공급사 추천 서비스 개발 및 운영 | 2021.04-2022.08

링크: [https://www.aitimes.kr/news/articleView.html?idxno=23023](https://www.aitimes.kr/news/articleView.html?idxno=23023)  
사용 기술: FastAPI, AWS SQS, AWS EKS, Tensorflow

- FastAPI 기반 공급업체 추천 서비스 백엔드 개발
- 물품, 공급사, 제조사 피처 벡터 생성을 위한 필드 선정 및 피처 벡터 생성 AI 모델 개발
- 추천 서비스 AI 모델 자동 학습 플로우 설계 및 파이프라인 구축
- 서비스 운영 6개월(2022.02 ~ 2022.08)
- MRO 업체 하루 평균 3만건의 구매 요청 중 70% 요청이 추천 기능 사용

#### 진동 데이터 수집기 임베디드 보드 개발 | 2020.01-2020.11

사용 기술: Linux Kernel, C++, TCP Socket

- 임베디드 리눅스 기반 진동 데이터 수집 장치 개발
- 진동 센서 리눅스 커널 모듈(드라이버) 개발
- 진동 데이터 송신 서버 개발
- 파일 시스템 안정성 최적화

## SIDE PROJECTS

### 알람 특화 SNS 개발 | 2024.08-Now

사용 기술: Kotlin, Spring Boot, K8S(Onpremise), FCM, Apache Kafka

- 프로덕트 컨셉 디자인
- JWT 기반 인증 서비스, 회원 서비스, 알림 그룹 서비스, FCM 메시지 서비스 개발
- 주기적 메시지 일괄 전송 배치 서비스 개발
- 쿠버네티스 기반 서비스 인프라 구축

### 면접 복기 어플리케이션 보끼 | 2023.11-2024.08

사용 기술: Kotlin, Spring Boot, AWS EC2, PostgreSQL

- 서비스 도메인 데이터 모델 설계 및 데이터 베이스 구축
- 인증(SNS 로그인), 사용자 정보 관리, 면접 일정관리, 면접 복기 관리 API 구축
- 서비스 인프라 및 모니터링 환경 구축

## INTERESTED IN

- 마이크로 서비스 아키텍처
- 대규모 트래픽 환경 고가용성 시스템 설계
- 도메인 주도 디자인

## PUBLICATIONS

- [Hyunjun Kim , Dohoon Kim , and Minho Kim , Mesh-based Marching Cubes on the GPU, Journal of the Korea Computer Graphics Society 24(1), pp. 1-8, Mar. (DOI: 10.15701/kcgs.2018.24.1.1) 2018](https://www.koreascience.kr/article/JAKO201810237887118.pdf)
- [Dohoon Kim, Mesh-based Marching Method on BCC Datasets(2018)](https://www.riss.kr/search/detail/DetailView.do?p_mat_type=be54d9b8bc7cdb09&control_no=a14066bf6a00bc43ffe0bdc3ef48d419&outLink=K)
- [Dohoon Kim , Hyunjun Kim , and Minho Kim , Mesh-Based Marching Tetrahedra on BCC Datasets, KCGS Conference (domestic), 2017](https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE07299387&language=ko_KR&hasTopBanner=true)
- [Hyunjun Kim , Dohoon Kim , and Minho Kim , Mesh-Based Marching Cubes, KCGS Conference (domestic), 2016](https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE06749207&language=ko_KR&hasTopBanner=true)

## COLLABORATOR & REFERENCE

- 박 근용  
  (주)날비컴퍼니, 유니티 개발 담당
- 박 현석  
  (주)날비컴퍼니, 유니티 개발 담당
- 허 형록  
  (주)버킷플레이스, 백엔드 개발 담당  
  [hhr@hhr.com](mailto:hhr@hhr.com)
- 정 병철  
  오토시맨틱스(주), 부사장, 개발 총괄  
  [cbc@live.co.kr](mailto:cbc@live.co.kr)
`,
  createdAt: "2026-06-20T09:00:00+09:00",
  updatedAt: "2026-07-01T11:30:00+09:00",
  deletedAt: null,
};

async function readResumeSeed() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const storeDirectory = path.join("/private/tmp", "blog-nextjs-dummy-post-store");
  const storeFilePath = path.join(storeDirectory, "resume.json");

  try {
    const storedValue = await fs.readFile(storeFilePath, "utf8");
    const parsedValue = JSON.parse(storedValue) as ResumeSeed | null;

    if (parsedValue && parsedValue.content === legacyResumeContent) {
      const migratedValue = {
        ...parsedValue,
        content: initialResumeSeed.content,
        updatedAt: new Date().toISOString(),
      };

      await fs.writeFile(
        storeFilePath,
        JSON.stringify(migratedValue, null, 2),
        "utf8",
      );

      return migratedValue;
    }

    return parsedValue ?? null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await fs.mkdir(storeDirectory, { recursive: true });
    await fs.writeFile(
      storeFilePath,
      JSON.stringify(initialResumeSeed, null, 2),
      "utf8",
    );

    return { ...initialResumeSeed };
  }
}

async function writeResumeSeed(resumeSeed: ResumeSeed | null) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const storeDirectory = path.join("/private/tmp", "blog-nextjs-dummy-post-store");
  const storeFilePath = path.join(storeDirectory, "resume.json");

  await fs.mkdir(storeDirectory, { recursive: true });
  await fs.writeFile(
    storeFilePath,
    JSON.stringify(resumeSeed, null, 2),
    "utf8",
  );
}

export async function createResumeDetailApiResponse(): Promise<
  ApiResponse<ResumeDetailDto> | null
> {
  const resumeSeed = await readResumeSeed();

  if (!resumeSeed) {
    return null;
  }

  return {
    status: 200,
    payload: resumeSeed,
    message: "success",
    code: "OK",
  };
}

export async function createResumeApiResponse(
  requestBody: SaveResumeRequestDto,
): Promise<ApiResponse<null>> {
  const existingResume = await readResumeSeed();

  if (existingResume) {
    return {
      status: 409,
      payload: null,
      message: "resume already exists",
      code: "RESUME_ALREADY_EXISTS",
    };
  }

  const now = new Date().toISOString();

  await writeResumeSeed({
    id: crypto.randomUUID(),
    content: requestBody.content,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  });

  return {
    status: 201,
    payload: null,
    message: "resume created",
    code: "RESUME_CREATED",
  };
}

export async function updateResumeApiResponse(
  requestBody: SaveResumeRequestDto,
): Promise<ApiResponse<null> | null> {
  const resumeSeed = await readResumeSeed();

  if (!resumeSeed) {
    return null;
  }

  resumeSeed.content = requestBody.content;
  resumeSeed.updatedAt = new Date().toISOString();
  await writeResumeSeed(resumeSeed);

  return {
    status: 200,
    payload: null,
    message: "resume updated",
    code: "RESUME_UPDATED",
  };
}

export async function deleteResumeApiResponse(): Promise<ApiResponse<null> | null> {
  const resumeSeed = await readResumeSeed();

  if (!resumeSeed) {
    return null;
  }

  await writeResumeSeed(null);

  return {
    status: 200,
    payload: null,
    message: "resume deleted",
    code: "RESUME_DELETED",
  };
}

export class DummyResumeRepository {
  async getResume(): Promise<ResumeDetailDto | null> {
    const response = await createResumeDetailApiResponse();

    return response?.payload ?? null;
  }
}

export const dummyResumeRepository = new DummyResumeRepository();

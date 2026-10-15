-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'UP', 'DEGRADED', 'DOWN');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'HEAD');

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "method" "HttpMethod" NOT NULL DEFAULT 'GET',
    "expected_status" SMALLINT NOT NULL DEFAULT 200,
    "check_interval_seconds" INTEGER NOT NULL DEFAULT 60,
    "timeout_ms" INTEGER NOT NULL DEFAULT 10000,
    "degraded_threshold_ms" INTEGER NOT NULL DEFAULT 1500,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "last_latency_ms" INTEGER,
    "last_checked_at" TIMESTAMPTZ(3),
    "next_check_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" BIGSERIAL NOT NULL,
    "application_id" UUID NOT NULL,
    "status" "ServiceStatus" NOT NULL,
    "status_code" SMALLINT,
    "latency_ms" INTEGER NOT NULL,
    "error" VARCHAR(500),
    "checked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_paused_next_check_at_idx" ON "applications"("paused", "next_check_at");

-- CreateIndex
CREATE INDEX "health_checks_application_id_checked_at_idx" ON "health_checks"("application_id", "checked_at" DESC);

-- CreateIndex
CREATE INDEX "health_checks_checked_at_idx" ON "health_checks"("checked_at");

-- AddForeignKey
ALTER TABLE "health_checks" ADD CONSTRAINT "health_checks_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

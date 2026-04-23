package config

import (
	"strings"
	"testing"
)

func TestIsProduction(t *testing.T) {
	cfg := &Config{Environment: "production"}
	if !cfg.IsProduction() {
		t.Fatal("expected IsProduction to return true")
	}

	cfg.Environment = "Production"
	if !cfg.IsProduction() {
		t.Fatal("expected IsProduction to be case-insensitive")
	}

	cfg.Environment = "development"
	if cfg.IsProduction() {
		t.Fatal("expected IsProduction to return false for development")
	}
}

func TestValidateAuthConfig_DevelopmentAllowsEmptySecrets(t *testing.T) {
	cfg := &Config{
		Environment:       "development",
		InternalAPISecret: "",
		SupabaseJWTSecret: "",
	}

	if err := cfg.ValidateAuthConfig(); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestValidateAuthConfig_ProductionRequiresSecrets(t *testing.T) {
	cfg := &Config{
		Environment:       "production",
		InternalAPISecret: "",
		SupabaseJWTSecret: "",
	}

	if err := cfg.ValidateAuthConfig(); err == nil {
		t.Fatal("expected error when required secrets are missing in production")
	}
}

func TestValidateAuthConfig_ProductionPassesWhenSecretsSet(t *testing.T) {
	cfg := &Config{
		Environment:       "production",
		InternalAPISecret: "internal-secret",
		SupabaseJWTSecret: "jwt-secret",
	}

	if err := cfg.ValidateAuthConfig(); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func FuzzIsProduction(f *testing.F) {
	f.Add("production")
	f.Add("Production")
	f.Add(" production ")
	f.Add("development")
	f.Add("")

	f.Fuzz(func(t *testing.T, environment string) {
		cfg := &Config{Environment: environment}
		got := cfg.IsProduction()
		want := strings.EqualFold(strings.TrimSpace(environment), "production")
		if got != want {
			t.Fatalf("IsProduction mismatch for %q: got=%v want=%v", environment, got, want)
		}
	})
}

func FuzzValidateAuthConfig(f *testing.F) {
	f.Add("production", "", "")
	f.Add("production", "internal", "")
	f.Add("production", "", "jwt")
	f.Add("production", "internal", "jwt")
	f.Add("development", "", "")
	f.Add("staging", "", "")
	f.Add(" Production ", " internal ", " jwt ")

	f.Fuzz(func(t *testing.T, environment, internalSecret, jwtSecret string) {
		cfg := &Config{
			Environment:       environment,
			InternalAPISecret: internalSecret,
			SupabaseJWTSecret: jwtSecret,
		}

		err := cfg.ValidateAuthConfig()
		isProd := strings.EqualFold(strings.TrimSpace(environment), "production")
		hasInternal := strings.TrimSpace(internalSecret) != ""
		hasJWT := strings.TrimSpace(jwtSecret) != ""
		shouldPass := !isProd || (hasInternal && hasJWT)

		if shouldPass && err != nil {
			t.Fatalf("expected no error for env=%q internal=%q jwt=%q, got %v", environment, internalSecret, jwtSecret, err)
		}
		if !shouldPass && err == nil {
			t.Fatalf("expected error for env=%q internal=%q jwt=%q", environment, internalSecret, jwtSecret)
		}
	})
}

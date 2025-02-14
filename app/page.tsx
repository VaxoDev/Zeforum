"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Award,
  Target,
  Shield,
  HelpCircle,
} from "lucide-react"

export default function Home() {
  const { user } = useAuthContext()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section (Unchanged) */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">მოგესალმებით ZeForum-ზე</h1>
        <p className="text-xl mb-8 text-muted-foreground">
          გააზიარეთ თქვენი იდეები და მოსაზრებები ჩვენი ქალაქის შესახებ
        </p>
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden"></div>
        {!user && (
          <Link href="/login">
            <Button size="lg" className="animate-bounce">
              შემოგვიერთდით დღესვე
            </Button>
          </Link>
        )}
      </motion.section>

      {/* About Zeforum Project Section */}
      <section className="container mx-auto px-4 py-16 bg-background text-foreground">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">ჩვენი პროექტის შესახებ</h2>
        <div className="items-center">
          <div>
            <p className="text-lg mb-4 text-foreground">
              ZeForum არის ინოვაციური სასკოლო პროექტი, რომელიც შეიქმნ�� იმისთვის, რომ გააძლიეროს მოქალაქეების ხმა და ხელი
              შეუწყოს საზოგადოებრივ ჩართულობას ჩვენს ქალაქში. ეს პლატფორმა წარმოადგენს ციფრულ სივრცეს, სადაც
              მოსწავლეები, მასწავლებლები და ადგილობრივი მოსახლეობა ერთიანდებიან, რათა განიხილონ მნიშვნელოვანი საკითხები
              და შეიმუშაონ ინოვაციური გადაწყვეტილებები.
            </p>
            <p className="text-lg mb-4 text-foreground">
              ჩვენი მიზანია, ხელი შევუწყოთ აქტიურ მოქალაქეობას, კრიტიკულ აზროვნებას და თანამშრომლობას. ZeForum-ის
              მეშვეობით, ჩვენ ვქმნით ხიდს განათლებასა და რეალურ სამყაროს შორის, რაც საშუალებას აძლევს მოსწავლეებს,
              გამოიყენონ თავიანთი ცოდნა პრაქტიკაში და პოზიტიური გავლენა მოახდინონ თავიანთ საზოგადოებაზე.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">ZeForum-ის უპირატესობები</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Lightbulb className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">ინოვაციური იდეები</h3>
            <p className="text-muted-foreground">წამოაყენეთ და განიხილეთ ახალი იდეები ქალაქის გაუმჯობესებისთვის</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Users className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">თანამშრომლობა</h3>
            <p className="text-muted-foreground">იმუშავეთ ერთად სხვა მოქალაქეებთან საერთო მიზნების მისაღწევად</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Target className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">რეალური ზეგავლენა</h3>
            <p className="text-muted-foreground">მიიღეთ მონაწილეობა დისკუსიებში, რომლებიც რეალურ ცვლილებებს იწვევს</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-background text-foreground">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">როგორ მუშაობს ZeForum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                იდეების გაზიარება
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                წაიკითხეთ პოსტები სხვადასხვა პრობლემის შესახებ, რომელიც გსურთ რომ გადაიჭრას. გახდით აქტიური მოქალაქე და
                ჩაერთეთ სხვადასხვა ღონისძიებებში.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                დისკუსია და თანამშრომლობა
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                ჩაერთეთ დისკუსიებში სკოლის მოსწავლეების მიერ გამოქვეყნებულ პოსტებზე. გააზიარეთ თქვენი მოსაზრებები,
                შესთავაზეთ გაუმჯობესებები და ითანამშრომლეთ იდეების დახვეწაზე.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                იდეების განვითარება
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                გამოიყენეთ საზოგადოების უკუკავშირი თქვენი იდეების გასაუმჯობესებლად. დააკვირდით, რომელი იდეები იღებენ მეტ
                მხარდაჭერას და რატომ.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-6 h-6 mr-2" />
                რეალიზაცია და აღიარება
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                საუკეთესო იდეები შეიძლება წარედგინოს ადგილობრივ ხელისუფლებას ან სკოლის ადმინისტრაციას განსახორციელებლად.
                მიიღეთ აღიარება თქვენი წვლილისთვის.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-background">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">ხშირად დასმული კითხვები</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  ვინ შეიძლება გამოიყენოს ZeForum?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ZeForum ღიაა ყველა მოსწავლისთვის, მასწავლებლისთვის და ადგილობრივი მოქალაქისთვის. ჩვენ ვცდილობთ
                  შევქმნათ მრავალფეროვანი საზოგადოება, სადაც ყველა ხმას აქვს მნიშვნელობა.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  რა სახის იდეები შემიძლია გავაზიარო?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  თქვენ შეგიძლიათ გააზიაროთ ნებისმიერი იდეა, რომელიც ეხება ჩვენი ქალაქის ან სკოლის გაუმჯობესებას. ეს
                  შეიძლება იყოს გარემოსდაცვითი ინიციატივები, საგანმანათლებლო პროგრამები, სოციალური პროექტები და სხვა.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  როგორ უზრუნველყოფთ უსაფრთხო და პოზიტიურ გარემოს?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ჩვენ ვიყენებთ მოდერაციის სისტემას და ქცევის კოდექსს, რათა უზრუნველვყოთ პატივისცემა და კონსტრუქციული
                  დიალოგი პლატფორმაზე. ყველა მომხმარებელს მოეთხოვება დაიცვას ეს წესები პოზიტიური გარემოს
                  შესანარჩუნებლად.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                  როგორ შემიძლია დავიწყო ZeForum-ის გამოყენება?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  დასაწყებად, უბრალოდ შექმენით ანგარიში ჩვენს პლატფორმაზე. შემდეგ შეგიძლიათ დაათვალიეროთ არსებული
                  პოსტები, გააზიაროთ საკუთარი იდეები, ან ჩაერთოთ დისკუსიებში. ჩვენი მეგობრული საზოგადოება ყოველთვის
                  მზადაა დაგეხმაროთ!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">შეუერთდით ZeForum-ს დღესვე</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              გახდით ცვლილების ნაწილი! ZeForum გაძლევთ შესაძლებლობას, გქონდეთ რეალური გავლენა თქვენს თემზე. დაიწყეთ
              იდეების გაზიარება და ითანამშრომლეთ უკეთესი მომავლისთვის.
            </p>
            {!user && (
              <Link href="/login">
                <Button size="lg" className="mt-4">
                  დაიწყეთ ახლავე
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

